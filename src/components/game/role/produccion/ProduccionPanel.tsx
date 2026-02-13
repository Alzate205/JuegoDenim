"use client";

import { FormEvent, useState } from "react";
import { Card } from "components/common/Card";
import { Button } from "components/common/Button";
import { ErrorMessage } from "components/common/ErrorMessage";

interface ProduccionPanelProps {
  gameCode: string;
  playerId: number;
}

export function ProduccionPanel({
  gameCode,
  playerId
}: ProduccionPanelProps) {
  const [plannedProduction, setPlannedProduction] = useState(100);
  const [extraHours, setExtraHours] = useState(false);
  const [minigameStrategy, setMinigameStrategy] = useState<
    "BALANCE_LINEA" | "MAXIMO_RITMO" | "MANTENIMIENTO_PREVENTIVO"
  >("BALANCE_LINEA");
  const [shiftPlan, setShiftPlan] = useState<"NORMAL" | "DOBLE_TURNO">(
    "NORMAL"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      const res = await fetch(`/api/game/${gameCode}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          type: "PRODUCCION",
          data: {
            plannedProduction,
            extraHours,
            minigameStrategy,
            shiftPlan
          }
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Error al enviar decisión.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Card title="Plan de producción de la semana">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-200">
              Producción planificada (unidades)
            </label>
            <input
              type="number"
              min={0}
              value={plannedProduction}
              onChange={(e) =>
                setPlannedProduction(Number(e.target.value) || 0)
              }
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-200">
              Uso de horas extra
            </label>
            <input
              type="checkbox"
              checked={extraHours}
              onChange={(e) => setExtraHours(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-200">Minijuego operativo</label>
            <select
              value={minigameStrategy}
              onChange={(e) =>
                setMinigameStrategy(
                  e.target.value as
                    | "BALANCE_LINEA"
                    | "MAXIMO_RITMO"
                    | "MANTENIMIENTO_PREVENTIVO"
                )
              }
              className="w-56 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
            >
              <option value="BALANCE_LINEA">Balance de línea (estable)</option>
              <option value="MAXIMO_RITMO">Máximo ritmo (más output, más presión)</option>
              <option value="MANTENIMIENTO_PREVENTIVO">Mantenimiento preventivo</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-slate-200">Acción exclusiva: plan de turnos</label>
            <select
              value={shiftPlan}
              onChange={(e) => setShiftPlan(e.target.value as "NORMAL" | "DOBLE_TURNO")}
              className="w-56 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
            >
              <option value="NORMAL">Turno normal</option>
              <option value="DOBLE_TURNO">Doble turno</option>
            </select>
          </div>
        </div>
      </Card>
      {error && <ErrorMessage message={error} />}
      {success && (
        <p className="text-xs text-emerald-400">
          Decisión registrada para esta semana.
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar decisiones de producción"}
      </Button>
    </form>
  );
}
