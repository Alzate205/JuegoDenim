"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Timeline } from "components/game/board/Timeline";
import { VisualBoard } from "components/game/board/VisualBoard";
import { GameSummaryPanel } from "components/game/board/GameSummaryPanel";
import { EventsPanel } from "components/game/board/EventsPanel";

import { LoadingSpinner } from "components/common/LoadingSpinner";
import { ErrorMessage } from "components/common/ErrorMessage";

export default function BoardPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchState() {
    try {
      setLoading(true);
      const res = await fetch(`/api/game/${code}/state`, {
        method: "GET",
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("No se pudo cargar el estado de la partida.");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Error desconocido al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }

  // Cargar solo UNA VEZ al entrar o cuando cambia el código de sala
  useEffect(() => {
    fetchState();
  }, [code]);

  if (loading && !data) {
    return <LoadingSpinner message="Cargando tablero general..." />;
  }

  if (error || !data) {
    return (
      <ErrorMessage
        message={error ?? "No se pudo obtener la información del tablero."}
      />
    );
  }

  const game = data.game;
  const { inventory, financial, pendingOrders, eventsActive } = data;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <Timeline
          currentWeek={game.currentWeek}
          totalWeeks={game.totalWeeks}
        />

        <button
          onClick={fetchState}
          className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
        >
          Actualizar estado
        </button>
      </div>

      <VisualBoard
        currentWeek={game.currentWeek}
        inventory={inventory}
        pendingOrders={pendingOrders}
      />

      <GameSummaryPanel
        inventory={inventory}
        financial={financial}
        pendingOrders={pendingOrders}
      />

      <EventsPanel events={eventsActive ?? []} />
    </div>
  );
}
