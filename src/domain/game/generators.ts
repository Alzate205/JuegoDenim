// src/domain/game/generators.ts

import {
  CustomerOrderDTO,
  GameEventDTO
} from "./types";
import {
  DEMAND_BASE_MIN,
  DEMAND_BASE_MAX
} from "./constants";

/**
 * Genera una demanda sencilla para una semana específica.
 * La lógica se puede hacer más compleja (por ejemplo, según semana, eventos, etc.).
 */
export function generateWeeklyDemand(
  gameId: number,
  week: number,
  basePrice = 20
): CustomerOrderDTO[] {
  const orders: CustomerOrderDTO[] = [];
  const numberOfOrders = randomInt(2, 5);

  for (let i = 0; i < numberOfOrders; i++) {
    const quantity = randomInt(DEMAND_BASE_MIN, DEMAND_BASE_MAX);
    const dueWeek = week + randomInt(0, 2); // entrega esta semana o próximas 2

    orders.push({
      id: -1, // se asignará en base de datos
      createdWeek: week,
      dueWeek,
      quantity,
      unitPrice: basePrice,
      deliveredQuantity: 0,
      status: "pendiente"
    });
  }

  return orders;
}

/**
 * Genera eventos aleatorios para una semana dada.
 * En esta versión, se crea un evento con baja probabilidad.
 */
export function generateRandomEvents(
  gameId: number,
  week: number
): GameEventDTO[] {
  const events: GameEventDTO[] = [];
  const roll = Math.random();

  if (roll < 0.15) {
    // 15 % de probabilidad de evento operativo
    events.push({
      id: -1,
      type: "operativo",
      description: "Falla en una máquina clave, la capacidad de producción disminuye.",
      effects: {
        productionCapacityMultiplier: 0.7,
        durationWeeks: 1
      }
    });
  } else if (roll < 0.25) {
    // 10 % de probabilidad de evento de demanda
    events.push({
      id: -1,
      type: "demanda",
      description: "Moda repentina de un modelo de jean, aumenta la demanda.",
      effects: {
        demandMultiplier: 1.3,
        durationWeeks: 1
      }
    });
  }

  return events;
}

/**
 * Determina si un evento está activo en una semana dada.
 * Asumimos que effects.durationWeeks indica cuántas semanas está activo.
 */
export function isEventActive(event: GameEventDTO, currentWeek: number, startWeek: number): boolean {
  const duration = event.effects?.durationWeeks ?? 1;
  const endWeek = startWeek + duration - 1;
  return currentWeek >= startWeek && currentWeek <= endWeek;
}

/**
 * Utilidad: entero aleatorio entre min y max inclusive.
 */
function randomInt(min: number, max: number): number {
  const v = Math.floor(Math.random() * (max - min + 1)) + min;
  return v;
}
