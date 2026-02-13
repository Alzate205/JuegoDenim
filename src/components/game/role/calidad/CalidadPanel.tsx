"use client";

import { FormEvent, useState } from "react";
import { Card } from "components/common/Card";
import { Button } from "components/common/Button";
import { ErrorMessage } from "components/common/ErrorMessage";

interface CalidadPanelProps {
  gameCode: string;
  playerId: number;
}

type InspectionLevel = "ALTO" | "MEDIO" | "BAJO";

export function CalidadPanel({ gameCode, playerId }: CalidadPanelProps) {
  const [inspectionLevel, setInspectionLevel] =
    useState<InspectionLevel>("MEDIO");
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
          type: "CALIDAD",
          data: { inspectionLevel }
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
      <Card title="Nivel de inspección de calidad">
        <div className="space-y-2 text-sm">
          <p className="text-slate-300">
            Seleccione el nivel de inspección para esta semana. Un nivel
            más alto reduce defectos pero aumenta costos.
          </p>
          <div className="flex flex-col gap-1 mt-2">
            {(["ALTO", "MEDIO", "BAJO"] as InspectionLevel[]).map(
              (level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 text-slate-200"
                >
                  <input
                    type="radio"
                    name="inspectionLevel"
                    value={level}
                    checked={inspectionLevel === level}
                    onChange={() => setInspectionLevel(level)}
                  />
                  <span>
                    {level === "ALTO" && "Alto (más control, más costo)"}
                    {level === "MEDIO" && "Medio (equilibrado)"}
                    {level === "BAJO" && "Bajo (menos costo, más riesgo)"}
                  </span>
                </label>
              )
            )}
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
        {loading ? "Enviando..." : "Enviar decisiones de calidad"}
      </Button>
    </form>
  );
}
