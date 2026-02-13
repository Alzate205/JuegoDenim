// src/domain/game/validation.ts

import { z } from "zod";
import {
  AnyDecision,
  DecisionCalidad,
  DecisionCompras,
  DecisionFinanzasLogistica,
  DecisionProduccion,
  Role
} from "./types";

/**
 * Esquemas Zod para validar las decisiones recibidas desde el cliente.
 */

const decisionComprasSchema = z.object({
  type: z.literal("COMPRAS"),
  orders: z
    .array(
      z.object({
        quantity: z.number().int().min(0),
        leadTime: z.number().int().min(0).max(10),
        costPerUnit: z.number().min(0)
      })
    )
    .default([]),
  minigameStrategy: z
    .enum(["NEGOCIAR_PRECIO", "ENTREGA_URGENTE", "PROVEEDOR_CONFIABLE"])
    .optional(),
  procurementMode: z
    .enum(["SPOT", "CONTRATO"])
    .optional()
});

const decisionProduccionSchema = z.object({
  type: z.literal("PRODUCCION"),
  plannedProduction: z.number().int().min(0),
  extraHours: z.boolean(),
  minigameStrategy: z
    .enum(["BALANCE_LINEA", "MAXIMO_RITMO", "MANTENIMIENTO_PREVENTIVO"])
    .optional(),
  shiftPlan: z
    .enum(["NORMAL", "DOBLE_TURNO"])
    .optional()
});

const decisionCalidadSchema = z.object({
  type: z.literal("CALIDAD"),
  inspectionLevel: z.enum(["ALTO", "MEDIO", "BAJO"]),
  minigameStrategy: z
    .enum(["MUESTREO_INTELIGENTE", "CALIBRACION_TOTAL", "AUDITORIA_EXPRESS"])
    .optional(),
  reworkPolicy: z
    .enum(["NINGUNO", "RETRABAJO_PARCIAL"])
    .optional()
});

const decisionFinanzasLogisticaSchema = z.object({
  type: z.literal("FINANZAS_LOGISTICA"),
  loans: z
    .array(
      z.object({
        amount: z.number().min(0),
        termWeeks: z.number().int().min(1),
        interestRate: z.number().min(0).max(1)
      })
    )
    .optional(),
  shippingPriorities: z.array(z.number().int()).default([]),
  minigameStrategy: z
    .enum(["CONSOLIDAR_CARGA", "ENVIO_EXPRESS", "PRIORIZAR_MOROSOS"])
    .optional(),
  cashAllocation: z
    .enum(["OPERACION", "PAGO_DEUDA"])
    .optional()
});

export const anyDecisionSchema = z.discriminatedUnion("type", [
  decisionComprasSchema,
  decisionProduccionSchema,
  decisionCalidadSchema,
  decisionFinanzasLogisticaSchema
]);

export type AnyDecisionInput = z.input<typeof anyDecisionSchema>;

/**
 * Valida que la decisión corresponda al rol indicado
 * y devuelve la decisión tipada fuertemente.
 */
export function validateDecisionForRole(
  role: Role,
  data: unknown
): AnyDecision {
  const parsed = anyDecisionSchema.parse(data);

  switch (role) {
    case "COMPRAS":
      if (parsed.type !== "COMPRAS") {
        throw new Error("Tipo de decisión incompatible con el rol COMPRAS.");
      }
      return parsed as DecisionCompras;
    case "PRODUCCION":
      if (parsed.type !== "PRODUCCION") {
        throw new Error("Tipo de decisión incompatible con el rol PRODUCCION.");
      }
      return parsed as DecisionProduccion;
    case "CALIDAD":
      if (parsed.type !== "CALIDAD") {
        throw new Error("Tipo de decisión incompatible con el rol CALIDAD.");
      }
      return parsed as DecisionCalidad;
    case "FINANZAS_LOGISTICA":
      if (parsed.type !== "FINANZAS_LOGISTICA") {
        throw new Error(
          "Tipo de decisión incompatible con el rol FINANZAS_LOGISTICA."
        );
      }
      return parsed as DecisionFinanzasLogistica;
    default:
      throw new Error(`Rol desconocido: ${role}`);
  }
}
