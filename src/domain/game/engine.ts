// src/domain/game/engine.ts

import {
  DecisionCalidad,
  DecisionCompras,
  DecisionFinanzasLogistica,
  DecisionProduccion,
  GameContext,
  GameEventDTO,
  RoundResult
} from "./types";
import {
  BASE_DEFECT_RATE,
  BASE_INTEREST_RATE_PER_WEEK,
  BASE_LABOR_COST_PER_UNIT,
  BASE_LOGISTICS_COST_PER_ORDER,
  BASE_QUALITY_COST_PER_UNIT,
  BASE_RAW_MATERIAL_COST_PER_UNIT,
  EXTRA_HOURS_FACTOR,
  PENALTY_PER_LATE_UNIT
} from "./constants";

/**
 * Función principal de dominio: procesa una semana de juego.
 */
export function processRound(context: GameContext): RoundResult {
  const {
    inventory,
    customerOrdersDue,
    purchaseOrdersArriving,
    financialStatePrev,
    decisions,
    eventsActive
  } = context;

  let rawMaterial = inventory.rawMaterial;
  let finishedGoods = inventory.finishedGoods;

  // 1. Llegada de materia prima
  const totalRawArrived = purchaseOrdersArriving.reduce(
    (sum, po) => sum + po.quantity,
    0
  );
  rawMaterial += totalRawArrived;

  // 2. Producción
  const decisionProd = decisions.produccion;
  const decisionCal = decisions.calidad;

  const capacity = calculateRealCapacity(decisionProd, eventsActive);
  const rawUsed = Math.min(rawMaterial, capacity);
  rawMaterial -= rawUsed;

  const grossProduction = rawUsed;
  const defectRate = calculateDefectRate(decisionCal, eventsActive);
  const goodUnits = Math.round(grossProduction * (1 - defectRate));
  const defectiveUnits = grossProduction - goodUnits;

  finishedGoods += goodUnits;

  // 3. Satisfacción de pedidos
  const decisionFinLog = decisions.finanzasLogistica;
  const ordersOrdered = prioritizeOrders(customerOrdersDue, decisionFinLog);

  let income = 0;
  const updatedOrders: typeof customerOrdersDue = [];

  for (const order of ordersOrdered) {
    const remaining = order.quantity - order.deliveredQuantity;
    if (remaining <= 0) {
      updatedOrders.push(order);
      continue;
    }

    const deliverQty = Math.min(remaining, finishedGoods);
    finishedGoods -= deliverQty;

    const newDelivered = order.deliveredQuantity + deliverQty;
    const newStatus =
      newDelivered >= order.quantity ? "cumplido" : "parcial";

    income += deliverQty * order.unitPrice;

    updatedOrders.push({
      ...order,
      deliveredQuantity: newDelivered,
      status: newStatus
    });
  }

  // 4. Costos
  const decisionCompras = decisions.compras;
  const rawMaterialCost = calculateRawMaterialCost(rawUsed, decisionCompras);
  const laborCost = calculateLaborCost(decisionProd, eventsActive);
  const qualityCost = calculateQualityCost(decisionCal, grossProduction);
  const logisticsCost = calculateLogisticsCost(
    customerOrdersDue,
    decisionFinLog
  );
  const interestCost = calculateInterestCost(financialStatePrev, decisionFinLog);
  const penaltiesCost = calculatePenalties(updatedOrders, context.week);

  const totalCosts =
    rawMaterialCost +
    laborCost +
    qualityCost +
    logisticsCost +
    interestCost +
    penaltiesCost;

  // 5. Préstamos nuevos
  const newLoansAmount = getNewLoansAmount(decisionFinLog);

  // 6. Resultados financieros
  const weeklyProfit = income - totalCosts;
  const accumulatedProfit =
    financialStatePrev.accumulatedProfit + weeklyProfit;
  const cash =
    financialStatePrev.cash +
    income -
    totalCosts +
    newLoansAmount;

  const newTotalDebt =
    financialStatePrev.totalDebt +
    newLoansAmount; // amortización se puede agregar luego

  return {
    newInventory: {
      rawMaterial,
      finishedGoods
    },
    updatedCustomerOrders: updatedOrders,
    newFinancialState: {
      cash,
      totalDebt: newTotalDebt,
      interestsPaid: interestCost,
      weeklyProfit,
      accumulatedProfit
    },
    income,
    costs: {
      rawMaterial: rawMaterialCost,
      labor: laborCost,
      quality: qualityCost,
      logistics: logisticsCost,
      interests: interestCost,
      penalties: penaltiesCost
    }
  };
}

/**
 * Capacidad real de producción considerando eventos.
 */
function calculateRealCapacity(
  decision: DecisionProduccion | undefined,
  events: GameEventDTO[]
): number {
  if (!decision) return 0;

  let capacity = decision.plannedProduction;

  // Aplicar eventos operativos que afecten capacidad
  for (const ev of events) {
    if (ev.type === "operativo" && ev.effects?.productionCapacityMultiplier) {
      capacity = Math.round(capacity * ev.effects.productionCapacityMultiplier);
    }
  }

  if (decision.extraHours) {
    capacity = Math.round(capacity * 1.2);
  }

  return Math.max(0, capacity);
}

/**
 * Calcula tasa de defectos según nivel de inspección y eventos activos.
 */
function calculateDefectRate(
  decision: DecisionCalidad | undefined,
  events: GameEventDTO[]
): number {
  if (!decision) return BASE_DEFECT_RATE.MEDIO;

  let base =
    BASE_DEFECT_RATE[decision.inspectionLevel] ??
    BASE_DEFECT_RATE.MEDIO;

  for (const ev of events) {
    if (ev.type === "operativo" && ev.effects?.defectRateIncrease) {
      base += ev.effects.defectRateIncrease;
    }
  }

  return Math.min(Math.max(base, 0), 0.5);
}

/**
 * Ordena pedidos según prioridades indicadas por Finanzas y Logística.
 */
function prioritizeOrders(
  orders: any[],
  decision: DecisionFinanzasLogistica | undefined
) {
  if (!decision || !decision.shippingPriorities?.length) {
    // Por defecto, ordenar por dueWeek ascendente
    return [...orders].sort((a, b) => a.dueWeek - b.dueWeek);
  }

  const orderMap = new Map<number, any>();
  orders.forEach((o) => orderMap.set(o.id, o));

  const prioritized: any[] = [];
  for (const id of decision.shippingPriorities) {
    const o = orderMap.get(id);
    if (o) {
      prioritized.push(o);
      orderMap.delete(id);
    }
  }
  // agregar los que faltan al final, ordenados por fecha
  const remaining = Array.from(orderMap.values()).sort(
    (a, b) => a.dueWeek - b.dueWeek
  );
  prioritized.push(...remaining);

  return prioritized;
}

/**
 * Costo de materia prima usada.
 * Si hay decisión de Compras con costos especiales, se podría refinar.
 */
function calculateRawMaterialCost(
  rawUsed: number,
  decisionCompras: DecisionCompras | undefined
): number {
  // Versión simple: costo fijo
  const unitCost = decisionCompras?.orders?.[0]?.costPerUnit ?? BASE_RAW_MATERIAL_COST_PER_UNIT;
  return rawUsed * unitCost;
}

function calculateLaborCost(
  decision: DecisionProduccion | undefined,
  events: GameEventDTO[]
): number {
  if (!decision) return 0;

  let unitCost = BASE_LABOR_COST_PER_UNIT;
  if (decision.extraHours) {
    unitCost *= EXTRA_HOURS_FACTOR;
  }

  // Se podrían aplicar eventos que aumenten costo de mano de obra

  return decision.plannedProduction * unitCost;
}

function calculateQualityCost(
  decision: DecisionCalidad | undefined,
  grossProduction: number
): number {
  if (!decision) return grossProduction * BASE_QUALITY_COST_PER_UNIT.MEDIO;
  const costPerUnit = BASE_QUALITY_COST_PER_UNIT[decision.inspectionLevel];
  return grossProduction * costPerUnit;
}

function calculateLogisticsCost(
  ordersDue: any[],
  decision: DecisionFinanzasLogistica | undefined
): number {
  // Versión básica: costo fijo por pedido con entrega
  const deliveredOrders = ordersDue.filter(
    (o) => o.deliveredQuantity > 0
  );
  return deliveredOrders.length * BASE_LOGISTICS_COST_PER_ORDER;
}

function calculateInterestCost(
  financialPrev: {
    totalDebt: number;
  },
  decisionFinLog: DecisionFinanzasLogistica | undefined
): number {
  // Intereses sobre deuda previa. Se podría extender a estructura de préstamos.
  const baseInterest = financialPrev.totalDebt * BASE_INTEREST_RATE_PER_WEEK;
  // No consideramos nuevos préstamos en esta semana para intereses inmediatos.
  return baseInterest;
}

/**
 * Penalizaciones por entregas atrasadas o no cumplidas.
 */
function calculatePenalties(
  updatedOrders: any[],
  currentWeek: number
): number {
  let penalties = 0;

  for (const order of updatedOrders) {
    // Pedido vencido sin completar
    if (
      order.dueWeek < currentWeek &&
      order.deliveredQuantity < order.quantity
    ) {
      const unitsLate = order.quantity - order.deliveredQuantity;
      penalties += unitsLate * PENALTY_PER_LATE_UNIT;
    }
  }

  return penalties;
}

function getNewLoansAmount(
  decision: DecisionFinanzasLogistica | undefined
): number {
  if (!decision || !decision.loans) return 0;
  return decision.loans.reduce((sum, l) => sum + l.amount, 0);
}
