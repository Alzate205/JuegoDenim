// tests/unit/domain/game/engine.test.ts

import { describe, it, expect } from "vitest";
import { processRound } from "domain/game/engine";
import type {
  GameContext,
  DecisionsByRole,
  GameEventDTO
} from "domain/game/types";

describe("processRound", () => {
  it("debe procesar una ronda simple y calcular inventarios y resultados financieros de forma coherente", () => {
    const week = 1;

    const decisions: DecisionsByRole = {
      compras: {
        type: "COMPRAS",
        orders: [
          {
            quantity: 0,
            leadTime: 1,
            costPerUnit: 5
          }
        ]
      },
      produccion: {
        type: "PRODUCCION",
        plannedProduction: 50,
        extraHours: false
      },
      calidad: {
        type: "CALIDAD",
        inspectionLevel: "MEDIO"
      },
      finanzasLogistica: {
        type: "FINANZAS_LOGISTICA",
        loans: [],
        shippingPriorities: []
      }
    };

    const eventsActive: GameEventDTO[] = [];

    const context: GameContext = {
      gameId: 1,
      week,
      inventory: {
        rawMaterial: 100,
        finishedGoods: 0
      },
      customerOrdersDue: [
        {
          id: 1,
          createdWeek: 0,
          dueWeek: 1,
          quantity: 40,
          unitPrice: 20,
          deliveredQuantity: 0,
          status: "pendiente"
        }
      ],
      purchaseOrdersArriving: [],
      financialStatePrev: {
        week: 0,
        cash: 10_000,
        totalDebt: 0,
        interestsPaid: 0,
        weeklyProfit: 0,
        accumulatedProfit: 0
      },
      eventsActive,
      decisions
    };

    const result = processRound(context);

    // Inventario esperado:
    // materia prima: 100 inicial - 50 usada = 50
    // producto terminado: 0 + 48 unidades buenas aprox (50 con 5 % defectos)
    expect(result.newInventory.rawMaterial).toBe(50);
    expect(result.newInventory.finishedGoods).toBeGreaterThanOrEqual(47);
    expect(result.newInventory.finishedGoods).toBeLessThanOrEqual(49);

    // Pedido: 40 unidades, se pueden despachar con las unidades buenas disponibles
    expect(result.updatedCustomerOrders[0].deliveredQuantity).toBe(40);
    expect(result.updatedCustomerOrders[0].status).toBe("cumplido");

    // Ingresos: 40 unidades * 20 = 800
    expect(result.income).toBeCloseTo(800, 1);

    // Costos aproximados:
    // materia prima: 50 * 5 = 250
    // mano de obra: 50 * 2 = 100
    // calidad: 50 * 0.3 = 15
    // logística: 1 pedido entregado * 10 = 10
    // intereses: 0 (sin deuda)
    // penalizaciones: 0 (pedido cumplido a tiempo)
    expect(result.costs.rawMaterial).toBeCloseTo(250, 1);
    expect(result.costs.labor).toBeCloseTo(100, 1);
    expect(result.costs.quality).toBeCloseTo(15, 1);
    expect(result.costs.logistics).toBeCloseTo(10, 1);
    expect(result.costs.interests).toBeCloseTo(0, 1);
    expect(result.costs.penalties).toBeCloseTo(0, 1);

    const totalCosts =
      result.costs.rawMaterial +
      result.costs.labor +
      result.costs.quality +
      result.costs.logistics +
      result.costs.interests +
      result.costs.penalties;

    // Utilidad: 800 - 375 = 425 (aproximado)
    expect(result.newFinancialState.weeklyProfit).toBeCloseTo(
      result.income - totalCosts,
      3
    );
    expect(result.newFinancialState.accumulatedProfit).toBeCloseTo(
      result.newFinancialState.weeklyProfit,
      3
    );

    // Caja final: 10 000 + ingresos - costos
    expect(result.newFinancialState.cash).toBeCloseTo(
      10_000 + result.income - totalCosts,
      3
    );
  });
});
