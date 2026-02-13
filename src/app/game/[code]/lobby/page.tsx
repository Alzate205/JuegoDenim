"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PlayerList } from "components/game/lobby/PlayerList";
import { LobbyStatus } from "components/game/lobby/LobbyStatus";
import { LoadingSpinner } from "components/common/LoadingSpinner";
import { ErrorMessage } from "components/common/ErrorMessage";

interface Player {
  id: number;
  name: string;
  role: string;
}

interface GameStateResponse {
  game: {
    id: number;
    code: string;
    status: string;
    currentWeek: number;
    totalWeeks: number;
  };
  players: Player[];
}

export default function LobbyPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [state, setState] = useState<GameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchState() {
      try {
        setLoading(true);
        const res = await fetch(`/api/game/${code}/state`);
        if (!res.ok) {
          throw new Error("No se pudo cargar el estado de la partida.");
        }
        const data = await res.json();
        setState(data);
      } catch (err: any) {
        setError(err.message || "Error desconocido.");
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, [code]);

  if (loading) {
    return <LoadingSpinner message="Cargando lobby..." />;
  }

  if (error || !state) {
    return <ErrorMessage message={error ?? "Error al cargar el lobby."} />;
  }

  return (
    <div className="space-y-6">
      <LobbyStatus
        status={state.game.status}
        playersCount={state.players.length}
        totalPlayersRequired={4}
      />
      <PlayerList players={state.players} />
    </div>
  );
}
