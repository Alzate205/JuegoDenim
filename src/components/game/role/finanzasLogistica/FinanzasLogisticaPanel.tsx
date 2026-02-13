"use client";

import { FormEvent, useState } from "react";
import { Card } from "components/common/Card";
import { Button } from "components/common/Button";
import { ErrorMessage } from "components/common/ErrorMessage";

interface FinanzasLogisticaPanelProps {
  gameCode: string;
  playerId: number;
}

export function FinanzasLogisticaPanel({
  gameCode,
  playerId
}: FinanzasLogisticaPanelProps) {
  const [loanAmount, setLoanAmount] = useState(0);
  const [loanTerm, setLoanTerm] = useState(4);
  const [loanRate, setLoanRate] = useState(0.05);
  const [shippingPriorities, setShippingPriorities] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const priorities = shippingPriorities
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));

    const loans =
      loanAmount > 0
        ? [{ amount: loanAmount, termWeeks: loanTerm, interestRate: loanRate }]
        : [];

    try {
      setLoading(true);
      const res = await fetch(`/api/game/${gameCode}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          type: "FINANZAS_LOGISTICA",
          data: { loans, shippingPriorities: priorities }
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
      <Card title="Préstamos">
        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-slate-300 text-xs">
              Monto del préstamo
            </label>
            <input
              type="number"
              min={0}
              value={loanAmount}
              onChange={(e) =>
                setLoanAmount(Number(e.target.value) || 0)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-300 text-xs">
              Plazo (semanas)
            </label>
            <input
              type="number"
              min={1}
              value={loanTerm}
              onChange={(e) =>
                setLoanTerm(Number(e.target.value) || 1)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-300 text-xs">
              Tasa de interés
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={loanRate}
              onChange={(e) =>
                setLoanRate(Number(e.target.value) || 0)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
            />
          </div>
        </div>
      </Card>

      <Card title="Prioridades de envío">
        <p className="text-xs text-slate-300 mb-2">
          Indique los IDs de pedidos, separados por coma, en el orden
          de prioridad de despacho.
        </p>
        <input
          type="text"
          value={shippingPriorities}
          onChange={(e) => setShippingPriorities(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm"
          placeholder="Ej: 12, 5, 8"
        />
      </Card>

      {error && <ErrorMessage message={error} />}
      {success && (
        <p className="text-xs text-emerald-400">
          Decisión registrada para esta semana.
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading
          ? "Enviando..."
          : "Enviar decisiones de finanzas y logística"}
      </Button>
    </form>
  );
}
