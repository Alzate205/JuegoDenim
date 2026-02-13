// src/domain/game/constants.ts

/**
 * Constantes y parámetros del modelo económico y operativo.
 */

export const INITIAL_CASH = 10_000;
export const INITIAL_RAW_MATERIAL = 100;
export const INITIAL_FINISHED_GOODS = 50;

export const BASE_RAW_MATERIAL_COST_PER_UNIT = 5;
export const BASE_LABOR_COST_PER_UNIT = 2;
export const EXTRA_HOURS_FACTOR = 1.5; // horas extra encarecen la mano de obra
export const BASE_QUALITY_COST_PER_UNIT = {
  ALTO: 0.5,
  MEDIO: 0.3,
  BAJO: 0.1
} as const;

export const BASE_DEFECT_RATE = {
  ALTO: 0.02,
  MEDIO: 0.05,
  BAJO: 0.1
} as const;

export const BASE_LOGISTICS_COST_PER_ORDER = 10;

export const BASE_INTEREST_RATE_PER_WEEK = 0.01; // 1 % por semana

export const PENALTY_PER_LATE_UNIT = 1.5;

/**
 * Parámetros de generación de demanda.
 */
export const DEMAND_BASE_MIN = 30;
export const DEMAND_BASE_MAX = 80;

/**
 * Otros parámetros del modelo.
 */
export const MAX_WEEKS = 52;
