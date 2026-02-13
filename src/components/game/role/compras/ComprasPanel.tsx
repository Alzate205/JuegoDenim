"use client";

import { FormEvent, useState } from "react";
import { Card } from "components/common/Card";
import { Button } from "components/common/Button";
import { ErrorMessage } from "components/common/ErrorMessage";
import { Table } from "components/common/Table";

interface ComprasPanelProps {
  gameCode: string;
  playerId: number;
}

export function ComprasPanel({ gameCode, playerId }: ComprasPanelProps) {
  const [orders, setOrders] = useState<
    { quantity: number; leadTime: number; costPerUnit: number }[]
  >([{ quantity: 0, leadTime: 1, costPerUnit: 5 }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateOrder(
    index: number,
    field: "quantity" | "leadTime" | "costPerUnit",
    value: number
  ) {
    setOrders((prev) =>
      prev.map((o, i) =>
        i === index ? { ...o, [field]: value } : o
      )
    );
  }

  function addOrder() {
    setOrders((prev) => [
      ...prev,
      { quantity: 0, leadTime: 1, costPerUnit: 5 }
    ]);
  }

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
          type: "COMPRAS",
          data: { orders }
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
      <Card title="Órdenes de compra de materia prima">
        <Table
          headers={[
            "Cantidad",
            "Plazo (semanas)",
            "Costo unitario"
          ]}
        >
          {orders.map((o, idx) => (
            <tr key={idx}>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={o.quantity}
                  onChange={(e) =>
                    updateOrder(idx, "quantity", Number(e.target.value))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={o.leadTime}
                  onChange={(e) =>
                    updateOrder(idx, "leadTime", Number(e.target.value))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={o.costPerUnit}
                  onChange={(e) =>
                    updateOrder(idx, "costPerUnit", Number(e.target.value))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm"
                />
              </td>
            </tr>
          ))}
        </Table>
        <div className="flex justify-between items-center mt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={addOrder}
            className="text-xs"
          >
            Agregar otra orden
          </Button>
        </div>
      </Card>
      {error && <ErrorMessage message={error} />}
      {success && (
        <p className="text-xs text-emerald-400">
          Decisión registrada para esta semana.
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar decisiones de compras"}
      </Button>
    </form>
  );
}
