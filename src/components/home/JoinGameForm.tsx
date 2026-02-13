"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/common/Button";
import { Card } from "components/common/Card";
import { ErrorMessage } from "components/common/ErrorMessage";

const roles = [
  {
    value: "COMPRAS",
    label: "Compras y abastecimiento"
  },
  {
    value: "PRODUCCION",
    label: "Producción"
  },
  {
    value: "CALIDAD",
    label: "Calidad"
  },
  {
    value: "FINANZAS_LOGISTICA",
    label: "Finanzas y logística"
  }
];

export function JoinGameForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("COMPRAS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/game/${code}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo unir a la partida.");
      }

      // Guardamos info básica del jugador para usar en el tablero
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "denim-factory-player",
          JSON.stringify({
            gameCode: data.code,
            playerId: data.playerId,
            role: data.role,
            name
          })
        );
      }

      // ⚠️ Aquí está el cambio importante:
      // Antes: router.push(`/game/${data.code}/lobby`);
      // Ahora: mandamos directo al TABLERO visual.
      router.push(`/game/${data.code}/board`);
    } catch (err: any) {
      setError(err.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-2">
        Unirse a una partida existente
      </h2>
      <p className="text-sm text-slate-300 mb-4">
        Ingresa el código de sala que compartió el profesor o el anfitrión.
      </p>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1">
            Código de sala
          </label>
          <input
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            placeholder="Ej: A3F9C2"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Nombre del jugador
          </label>
          <input
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Rol</label>
          <select
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Uniéndose..." : "Unirse a partida"}
        </Button>
      </form>
    </Card>
  );
}
