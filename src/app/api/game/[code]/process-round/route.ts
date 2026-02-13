// src/app/api/game/[code]/process-round/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { buildGameContext } from "domain/game/mappers";
import { processRound } from "domain/game/engine";
import type {
  DecisionsByRole
} from "domain/game/types";

/**
 * Procesa la semana actual de la partida:
 * - Verifica que existan decisiones de todos los jugadores.
 * - Construye el contexto de juego.
 * - Llama al motor de simulación.
 * - Persiste los resultados en la base de datos.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { code: params.code },
      include: { players: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Partida no encontrada." },
        { status: 404 }
      );
    }

    // Permitimos procesar si el juego está EN_CURSO o CONFIGURANDO
    // (CONFIGURANDO se usa como "pre-juego", pero para jugar solo
    // queremos poder avanzar aunque falten jugadores).
    if (game.status !== "EN_CURSO" && game.status !== "CONFIGURANDO") {
      return NextResponse.json(
        { error: "La partida no está en un estado válido para avanzar." },
        { status: 400 }
      );
    }


    const week = game.currentWeek;

    // 1. Comprobar decisiones
    const decisions = await prisma.decision.findMany({
      where: {
        gameId: game.id,
        week
      },
      include: {
        player: true
      }
    });

    // Para pruebas y modo con bots:
    // si no hay ninguna decisión, sí devolvemos error,
    // pero si hay al menos una, permitimos procesar la ronda
    // y completamos lo que falte con bots.
    if (decisions.length === 0) {
      return NextResponse.json(
        { error: "No hay decisiones registradas para esta semana." },
        { status: 400 }
      );
    }


    // 2. Cargar estado previo (semana anterior)
    const prevWeek = week - 1;

    const inventoryStatePrev = await prisma.inventoryState.findUnique({
      where: {
        gameId_week: {
          gameId: game.id,
          week: prevWeek
        }
      }
    });

    const financialStatePrev = await prisma.financialState.findUnique({
      where: {
        gameId_week: {
          gameId: game.id,
          week: prevWeek
        }
      }
    });

    if (!inventoryStatePrev || !financialStatePrev) {
      return NextResponse.json(
        {
          error:
            "No existe estado previo de inventario o financiero para esta semana."
        },
        { status: 500 }
      );
    }

    // Pedidos de clientes que tienen fecha de entrega hasta esta semana
    const customerOrdersDue = await prisma.customerOrder.findMany({
      where: {
        gameId: game.id,
        dueWeek: { lte: week },
        status: { in: ["pendiente", "parcial"] }
      }
    });

    // Órdenes de compra que llegan esta semana
    const purchaseOrdersArriving = await prisma.purchaseOrder.findMany({
      where: {
        gameId: game.id,
        estimatedWeek: week,
        status: { in: ["pendiente", "retrasado"] }
      }
    });

    // Eventos activos
    const eventsActive = await prisma.gameEvent.findMany({
      where: {
        gameId: game.id,
        startWeek: { lte: week },
        endWeek: { gte: week }
      }
    });

    // 3. Armar decisiones por rol
    const decisionsByRole: DecisionsByRole = {};

    for (const d of decisions) {
      const parsed = JSON.parse(d.dataJson);
      switch (d.player.role) {
        case "COMPRAS":
          decisionsByRole.compras = parsed;
          break;
        case "PRODUCCION":
          decisionsByRole.produccion = parsed;
          break;
        case "CALIDAD":
          decisionsByRole.calidad = parsed;
          break;
        case "FINANZAS_LOGISTICA":
          decisionsByRole.finanzasLogistica = parsed;
          break;
        default:
          break;
      }
    }
        // Completar decisiones faltantes con "bots" sencillos.
    // Si un rol no envió decisión, usamos una estrategia por defecto.

    if (!decisionsByRole.compras) {
      decisionsByRole.compras = {
        type: "COMPRAS",
        orders: [
          {
            quantity: 80,       // el bot pide materia prima moderada
            leadTime: 1,        // entrega en 1 semana
            costPerUnit: 5      // costo base
          }
        ]
      };
    }

    if (!decisionsByRole.produccion) {
      decisionsByRole.produccion = {
        type: "PRODUCCION",
        plannedProduction: 80, // producción estándar
        extraHours: false      // sin horas extra
      };
    }

    if (!decisionsByRole.calidad) {
      decisionsByRole.calidad = {
        type: "CALIDAD",
        inspectionLevel: "MEDIO" // equilibrio entre costo y defectos
      };
    }

    if (!decisionsByRole.finanzasLogistica) {
      decisionsByRole.finanzasLogistica = {
        type: "FINANZAS_LOGISTICA",
        loans: [],              // sin préstamos por defecto
        shippingPriorities: []  // prioridad por fecha (lo maneja el engine)
      };
    }


    // 4. Construir contexto y procesar ronda
    const context = buildGameContext({
      gameId: game.id,
      week,
      inventoryState: inventoryStatePrev,
      customerOrdersDue,
      purchaseOrdersArriving,
      financialStatePrev,
      eventsActive,
      decisionsByRole
    });

    const result = processRound(context);

    // 5. Persistir resultados en una transacción
    const updated = await prisma.$transaction(async (tx) => {
      // Inventario de la semana actual
      await tx.inventoryState.create({
        data: {
          gameId: game.id,
          week,
          rawMaterialInventory: result.newInventory.rawMaterial,
          finishedGoodsInventory: result.newInventory.finishedGoods
        }
      });

      // Actualizar pedidos de clientes
      for (const order of result.updatedCustomerOrders) {
        await tx.customerOrder.update({
          where: { id: order.id },
          data: {
            deliveredQuantity: order.deliveredQuantity,
            status: order.status
          }
        });
      }

      // Marcar órdenes de compra recibidas
      for (const po of purchaseOrdersArriving) {
        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: {
            status: "recibido"
          }
        });
      }

      // Estado financiero de la semana actual
      await tx.financialState.create({
        data: {
          gameId: game.id,
          week,
          cash: result.newFinancialState.cash,
          totalDebt: result.newFinancialState.totalDebt,
          interestsPaid: result.newFinancialState.interestsPaid,
          weeklyProfit: result.newFinancialState.weeklyProfit,
          accumulatedProfit: result.newFinancialState.accumulatedProfit
        }
      });

      const isLastWeek = week >= game.totalWeeks;

      // Si el juego estaba CONFIGURANDO, al procesar la primera ronda
      // lo pasamos automáticamente a EN_CURSO.
      const shouldStartNow = game.status === "CONFIGURANDO";

      const newStatus = isLastWeek
        ? "FINALIZADA"
        : shouldStartNow
        ? "EN_CURSO"
        : game.status;

      const newWeek = isLastWeek ? week : week + 1;

      const updatedGame = await tx.game.update({
        where: { id: game.id },
        data: {
          currentWeek: newWeek,
          status: newStatus
        }
      });


      return updatedGame;
    });

    return NextResponse.json({
      ok: true,
      game: {
        id: updated.id,
        code: updated.code,
        status: updated.status,
        currentWeek: updated.currentWeek,
        totalWeeks: updated.totalWeeks
      },
      result
    });
  } catch (error) {
    console.error("Error al procesar la ronda:", error);
    return NextResponse.json(
      { error: "Error al procesar la ronda" },
      { status: 500 }
    );
  }
}
