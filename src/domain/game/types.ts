// src/domain/game/types.ts

export type Role = "COMPRAS" | "PRODUCCION" | "CALIDAD" | "FINANZAS_LOGISTICA";

export type GameStatus = "CONFIGURANDO" | "EN_CURSO" | "FINALIZADA";

/**
 * Representa un pedido de cliente dentro del dominio (DTO simplificado).
 */
export interface CustomerOrderDTO {
  id: number;
  createdWeek: number;
  dueWeek: number;
  quantity: number;
  unitPrice: number;
  deliveredQuantity: number;
  status: "pendiente" | "parcial" | "cumplido" | "atrasado";
}

/**
 * Representa una orden de compra de materia prima que llega en esta semana.
 */
export interface PurchaseOrderDTO {
  id: number;
  requestedWeek: number;
  estimatedWeek: number;
  quantity: number;
  totalCost: number;
  status: "pendiente" | "recibido" | "retrasado";
}

/**
 * Estado financiero mínimo necesario para procesar la ronda.
 */
export interface FinancialStateDTO {
  week: number;
  cash: number;
  totalDebt: number;
  interestsPaid: number;
  weeklyProfit: number;
  accumulatedProfit: number;
}

/**
 * Evento de juego activo en una semana dada.
 */
export interface GameEventDTO {
  id: number;
  type: "operativo" | "demanda" | "financiero" | "logistico";
  description: string;
  effects: any; // se puede especializar según el tipo de evento
}

/**
 * Decisión del rol de Compras.
 */
export interface DecisionCompras {
  type: "COMPRAS";
  orders: {
    quantity: number; // unidades de materia prima a ordenar
    leadTime: number; // semanas de entrega
    costPerUnit: number;
  }[];
}

/**
 * Decisión del rol de Producción.
 */
export interface DecisionProduccion {
  type: "PRODUCCION";
  plannedProduction: number; // cantidad de jeans a producir
  extraHours: boolean; // uso de horas extra
}

/**
 * Decisión del rol de Calidad.
 */
export interface DecisionCalidad {
  type: "CALIDAD";
  inspectionLevel: "ALTO" | "MEDIO" | "BAJO";
}

/**
 * Decisión del rol de Finanzas y Logística.
 */
export interface DecisionFinanzasLogistica {
  type: "FINANZAS_LOGISTICA";
  loans?: {
    amount: number;
    termWeeks: number;
    interestRate: number;
  }[];
  shippingPriorities: number[]; // IDs de pedidos en orden de prioridad
}

/**
 * Unión de todas las posibles decisiones.
 */
export type AnyDecision =
  | DecisionCompras
  | DecisionProduccion
  | DecisionCalidad
  | DecisionFinanzasLogistica;

/**
 * Decisiones agrupadas por rol para una semana.
 */
export interface DecisionsByRole {
  compras?: DecisionCompras;
  produccion?: DecisionProduccion;
  calidad?: DecisionCalidad;
  finanzasLogistica?: DecisionFinanzasLogistica;
}

/**
 * Contexto de juego necesario para procesar una semana.
 */
export interface GameContext {
  gameId: number;
  week: number;
  inventory: {
    rawMaterial: number;
    finishedGoods: number;
  };
  customerOrdersDue: CustomerOrderDTO[];
  purchaseOrdersArriving: PurchaseOrderDTO[];
  financialStatePrev: FinancialStateDTO;
  eventsActive: GameEventDTO[];
  decisions: DecisionsByRole;
}

/**
 * Resultado de la simulación de una semana.
 */
export interface RoundResult {
  newInventory: {
    rawMaterial: number;
    finishedGoods: number;
  };
  updatedCustomerOrders: CustomerOrderDTO[];
  newFinancialState: {
    cash: number;
    totalDebt: number;
    interestsPaid: number;
    weeklyProfit: number;
    accumulatedProfit: number;
  };
  income: number;
  costs: {
    rawMaterial: number;
    labor: number;
    quality: number;
    logistics: number;
    interests: number;
    penalties: number;
  };
}
