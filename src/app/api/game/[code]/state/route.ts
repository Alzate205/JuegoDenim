// src/app/api/game/[code]/state/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { code: params.code },
      include: {
        players: true,
        inventoryStates: {
          orderBy: { week: "desc" },
          take: 1
        },
        financialStates: {
          orderBy: { week: "desc" },
          take: 1
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Partida no encontrada." },
        { status: 404 }
      );
    }

    const currentWeek = game.currentWeek;

    const inventory = game.inventoryStates[0] ?? null;
    const financial = game.financialStates[0] ?? null;

    const pendingOrders = await prisma.customerOrder.findMany({
      where: {
        gameId: game.id,
        status: { in: ["pendiente", "parcial"] }
      },
      orderBy: { dueWeek: "asc" }
    });

    const eventsActive = await prisma.gameEvent.findMany({
      where: {
        gameId: game.id,
        startWeek: { lte: currentWeek },
        endWeek: { gte: currentWeek }
      }
    });

    return NextResponse.json({
      game: {
        id: game.id,
        code: game.code,
        status: game.status,
        currentWeek,
        totalWeeks: game.totalWeeks
      },
      players: game.players.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role
      })),
      inventory: inventory
        ? {
            week: inventory.week,
            rawMaterial: inventory.rawMaterialInventory,
            finishedGoods: inventory.finishedGoodsInventory
          }
        : null,
      financial: financial
        ? {
            week: financial.week,
            cash: financial.cash,
            totalDebt: financial.totalDebt,
            interestsPaid: financial.interestsPaid,
            weeklyProfit: financial.weeklyProfit,
            accumulatedProfit: financial.accumulatedProfit
          }
        : null,
      pendingOrders,
      eventsActive
    });
  } catch (error) {
    console.error("Error obteniendo estado de partida:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado de la partida" },
      { status: 500 }
    );
  }
}
