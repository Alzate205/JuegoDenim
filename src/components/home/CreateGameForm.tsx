"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/common/Button";
import { Card } from "components/common/Card";
import { ErrorMessage } from "components/common/ErrorMessage";

export function CreateGameForm() {
  const router = useRouter();
  const [weeks, setWeeks] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ totalWeeks: weeks })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo crear la partida.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "denim-factory-host",
          JSON.stringify({
            code: data.code,
            isHost: true
          })
        );
      }

      router.push(`/game/${data.code}/lobby`);
    } catch (err: any) {
      setError(err.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-2">Crear nueva partida</h2>
      <p className="text-sm text-slate-300 mb-4">
        Define cuántas semanas durará la simulación de la fábrica de denim.
      </p>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1">
            Número de semanas de simulación
          </label>
          <input
            type="number"
            min={4}
            max={20}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            value={weeks}
            onChange={(e) => setWeeks(parseInt(e.target.value) || 1)}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creando..." : "Crear partida"}
        </Button>
      </form>
    </Card>
  );
}
