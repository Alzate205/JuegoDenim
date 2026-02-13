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
  const defectRate = calculateDefectRate(
    decisionCal,
    decisionProd,
    decisions.compras,
    eventsActive
  );
  const goodUnits = Math.round(grossProduction * (1 - defectRate));
  const defectiveUnits = grossProduction - goodUnits;

  let recoveredUnits = 0;
  if (decisionCal?.reworkPolicy === "RETRABAJO_PARCIAL") {
    recoveredUnits = Math.round(defectiveUnits * 0.5);
  }

  finishedGoods += goodUnits + recoveredUnits;

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
  const qualityCost = calculateQualityCost(
    decisionCal,
    grossProduction,
    recoveredUnits
  );
  const logisticsCost = calculateLogisticsCost(
    customerOrdersDue,
    decisionFinLog
  );
  const interestCost = calculateInterestCost(financialStatePrev, decisionFinLog);
  const penaltiesCost = calculatePenalties(
    updatedOrders,
    context.week,
    decisionFinLog
  );

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

  if (decision.minigameStrategy === "BALANCE_LINEA") {
    capacity = Math.round(capacity * 1.1);
  }

  if (decision.minigameStrategy === "MAXIMO_RITMO") {
    capacity = Math.round(capacity * 1.2);
  }

  if (decision.minigameStrategy === "MANTENIMIENTO_PREVENTIVO") {
    capacity = Math.round(capacity * 0.9);
  }

  if (decision.shiftPlan === "DOBLE_TURNO") {
    capacity = Math.round(capacity * 1.15);
  }

  return Math.max(0, capacity);
}

/**
 * Calcula tasa de defectos según nivel de inspección y eventos activos.
 */
function calculateDefectRate(
  decision: DecisionCalidad | undefined,
  decisionProd: DecisionProduccion | undefined,
  decisionCompras: DecisionCompras | undefined,
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

  if (decision?.minigameStrategy === "MUESTREO_INTELIGENTE") {
    base -= 0.01;
  }

  if (decision?.minigameStrategy === "CALIBRACION_TOTAL") {
    base -= 0.02;
  }

  if (decision?.minigameStrategy === "AUDITORIA_EXPRESS") {
    base += 0.01;
  }

  if (decisionProd?.minigameStrategy === "MAXIMO_RITMO") {
    base += 0.02;
  }

  if (decisionProd?.minigameStrategy === "MANTENIMIENTO_PREVENTIVO") {
    base -= 0.01;
  }

  if (decisionCompras?.procurementMode === "SPOT") {
    base += 0.01;
  }

  if (decisionCompras?.procurementMode === "CONTRATO") {
    base -= 0.005;
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
  let strategyMultiplier = 1;

  if (decisionCompras?.minigameStrategy === "NEGOCIAR_PRECIO") {
    strategyMultiplier = 0.92;
  }

  if (decisionCompras?.minigameStrategy === "ENTREGA_URGENTE") {
    strategyMultiplier = 1.08;
  }

  if (decisionCompras?.procurementMode === "SPOT") {
    strategyMultiplier *= 0.94;
  }

  if (decisionCompras?.procurementMode === "CONTRATO") {
    strategyMultiplier *= 1.04;
  }

  return rawUsed * unitCost * strategyMultiplier;
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

  if (decision.minigameStrategy === "MAXIMO_RITMO") {
    unitCost *= 1.15;
  }

  if (decision.minigameStrategy === "MANTENIMIENTO_PREVENTIVO") {
    unitCost *= 0.95;
  }

  if (decision.shiftPlan === "DOBLE_TURNO") {
    unitCost *= 1.2;
  }

  // Se podrían aplicar eventos que aumenten costo de mano de obra

  return decision.plannedProduction * unitCost;
}

function calculateQualityCost(
  decision: DecisionCalidad | undefined,
  grossProduction: number,
  recoveredUnits: number
): number {
  if (!decision) return grossProduction * BASE_QUALITY_COST_PER_UNIT.MEDIO;
  let costPerUnit = BASE_QUALITY_COST_PER_UNIT[decision.inspectionLevel];

  if (decision.minigameStrategy === "MUESTREO_INTELIGENTE") {
    costPerUnit *= 0.95;
  }

  if (decision.minigameStrategy === "CALIBRACION_TOTAL") {
    costPerUnit *= 1.1;
  }

  if (decision.minigameStrategy === "AUDITORIA_EXPRESS") {
    costPerUnit *= 0.9;
  }

  const reworkCost =
    decision.reworkPolicy === "RETRABAJO_PARCIAL"
      ? recoveredUnits * 0.4
      : 0;

  return grossProduction * costPerUnit + reworkCost;
}

function calculateLogisticsCost(
  ordersDue: any[],
  decision: DecisionFinanzasLogistica | undefined
): number {
  // Versión básica: costo fijo por pedido con entrega
  const deliveredOrders = ordersDue.filter(
    (o) => o.deliveredQuantity > 0
  );
  let multiplier = 1;

  if (decision?.minigameStrategy === "CONSOLIDAR_CARGA") {
    multiplier = 0.85;
  }

  if (decision?.minigameStrategy === "ENVIO_EXPRESS") {
    multiplier = 1.2;
  }

  if (decision?.cashAllocation === "PAGO_DEUDA") {
    multiplier *= 1.05;
  }

  return deliveredOrders.length * BASE_LOGISTICS_COST_PER_ORDER * multiplier;
}

function calculateInterestCost(
  financialPrev: {
    totalDebt: number;
  },
  decisionFinLog: DecisionFinanzasLogistica | undefined
): number {
  // Intereses sobre deuda previa. Se podría extender a estructura de préstamos.
  let baseInterest = financialPrev.totalDebt * BASE_INTEREST_RATE_PER_WEEK;

  if (decisionFinLog?.cashAllocation === "PAGO_DEUDA") {
    baseInterest *= 0.8;
  }
  // No consideramos nuevos préstamos en esta semana para intereses inmediatos.
  return baseInterest;
}

/**
 * Penalizaciones por entregas atrasadas o no cumplidas.
 */
function calculatePenalties(
  updatedOrders: any[],
  currentWeek: number,
  decisionFinLog: DecisionFinanzasLogistica | undefined
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

  if (decisionFinLog?.minigameStrategy === "ENVIO_EXPRESS") {
    penalties *= 0.85;
  }

  if (decisionFinLog?.minigameStrategy === "PRIORIZAR_MOROSOS") {
    penalties *= 0.7;
  }

  if (decisionFinLog?.cashAllocation === "OPERACION") {
    penalties *= 0.9;
  }

  return penalties;
}

function getNewLoansAmount(
  decision: DecisionFinanzasLogistica | undefined
): number {
  if (!decision || !decision.loans) return 0;
  return decision.loans.reduce((sum, l) => sum + l.amount, 0);
}
