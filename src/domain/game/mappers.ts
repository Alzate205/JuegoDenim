// src/domain/game/mappers.ts

import {
  CustomerOrderDTO,
  FinancialStateDTO,
  GameContext,
  GameEventDTO,
  PurchaseOrderDTO
} from "./types";
import type {
  CustomerOrder,
  FinancialState,
  GameEvent,
  InventoryState,
  PurchaseOrder
} from "@prisma/client";

/**
 * Mapea entidades Prisma a DTOs de dominio.
 */

export function mapCustomerOrderToDTO(order: CustomerOrder): CustomerOrderDTO {
  return {
    id: order.id,
    createdWeek: order.createdWeek,
    dueWeek: order.dueWeek,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    deliveredQuantity: order.deliveredQuantity,
    status: order.status as CustomerOrderDTO["status"]
  };
}

export function mapPurchaseOrderToDTO(po: PurchaseOrder): PurchaseOrderDTO {
  return {
    id: po.id,
    requestedWeek: po.requestedWeek,
    estimatedWeek: po.estimatedWeek,
    quantity: po.quantity,
    totalCost: po.totalCost,
    status: po.status as PurchaseOrderDTO["status"]
  };
}

export function mapFinancialStateToDTO(
  state: FinancialState
): FinancialStateDTO {
  return {
    week: state.week,
    cash: state.cash,
    totalDebt: state.totalDebt,
    interestsPaid: state.interestsPaid,
    weeklyProfit: state.weeklyProfit,
    accumulatedProfit: state.accumulatedProfit
  };
}

export function mapGameEventToDTO(event: GameEvent): GameEventDTO {
  let effects: any;
  try {
    effects = JSON.parse(event.effectsJson);
  } catch {
    effects = {};
  }

  return {
    id: event.id,
    type: event.type as GameEventDTO["type"],
    description: event.description,
    effects
  };
}

/**
 * Construye el contexto de juego requerido por el engine a partir
 * de entidades Prisma.
 */
export function buildGameContext(params: {
  gameId: number;
  week: number;
  inventoryState: InventoryState;
  customerOrdersDue: CustomerOrder[];
  purchaseOrdersArriving: PurchaseOrder[];
  financialStatePrev: FinancialState;
  eventsActive: GameEvent[];
  decisionsByRole: GameContext["decisions"];
}): GameContext {
  const {
    gameId,
    week,
    inventoryState,
    customerOrdersDue,
    purchaseOrdersArriving,
    financialStatePrev,
    eventsActive,
    decisionsByRole
  } = params;

  return {
    gameId,
    week,
    inventory: {
      rawMaterial: inventoryState.rawMaterialInventory,
      finishedGoods: inventoryState.finishedGoodsInventory
    },
    customerOrdersDue: customerOrdersDue.map(mapCustomerOrderToDTO),
    purchaseOrdersArriving: purchaseOrdersArriving.map(
      mapPurchaseOrderToDTO
    ),
    financialStatePrev: mapFinancialStateToDTO(financialStatePrev),
    eventsActive: eventsActive.map(mapGameEventToDTO),
    decisions: decisionsByRole
  };
}
