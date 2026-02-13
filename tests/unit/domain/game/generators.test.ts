// tests/unit/domain/game/generators.test.ts

import { describe, it, expect } from "vitest";
import {
  generateWeeklyDemand,
  generateRandomEvents
} from "domain/game/generators";
import {
  DEMAND_BASE_MIN,
  DEMAND_BASE_MAX
} from "domain/game/constants";

describe("generateWeeklyDemand", () => {
  it("debe generar un conjunto de pedidos dentro de los rangos esperados", () => {
    const gameId = 1;
    const week = 1;
    const orders = generateWeeklyDemand(gameId, week, 20);

    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThanOrEqual(2);
    expect(orders.length).toBeLessThanOrEqual(5);

    for (const order of orders) {
      expect(order.quantity).toBeGreaterThanOrEqual(DEMAND_BASE_MIN);
      expect(order.quantity).toBeLessThanOrEqual(DEMAND_BASE_MAX);
      expect(order.dueWeek).toBeGreaterThanOrEqual(week);
      expect(order.dueWeek).toBeLessThanOrEqual(week + 2);
      expect(order.unitPrice).toBe(20);
      expect(order.status).toBe("pendiente");
    }
  });
});

describe("generateRandomEvents", () => {
  it("debe devolver un arreglo de eventos válido (posiblemente vacío)", () => {
    const events = generateRandomEvents(1, 1);
    expect(Array.isArray(events)).toBe(true);

    for (const ev of events) {
      expect(typeof ev.type).toBe("string");
      expect(typeof ev.description).toBe("string");
      expect(ev.effects).toBeTypeOf("object");
    }
  });
});
