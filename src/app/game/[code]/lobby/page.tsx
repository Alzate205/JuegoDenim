"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [state, setState] = useState<GameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchState(showLoader = false) {
      try {
        if (showLoader) {
          setLoading(true);
        }
        const res = await fetch(`/api/game/${code}/state`);
        if (!res.ok) {
          throw new Error("No se pudo cargar el estado de la partida.");
        }
        const data = await res.json();
        setState(data);
      } catch (err: any) {
        setError(err.message || "Error desconocido.");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    }

    const hostData =
      typeof window !== "undefined"
        ? window.localStorage.getItem("denim-factory-host")
        : null;

    if (hostData) {
      try {
        const parsed = JSON.parse(hostData) as { code?: string; isHost?: boolean };
        setIsHost(Boolean(parsed.isHost && parsed.code === code));
      } catch {
        setIsHost(false);
      }
    }

    fetchState(true);
    const interval = setInterval(() => {
      fetchState(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [code]);

  async function handleStartGame() {
    try {
      setStartError(null);
      setStarting(true);

      const res = await fetch(`/api/game/${code}/start`, {
        method: "POST"
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo iniciar la partida.");
      }

      router.push(`/game/${code}/board`);
    } catch (err: any) {
      setStartError(err.message || "Error al iniciar la partida.");
    } finally {
      setStarting(false);
    }
  }

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
        isHost={isHost}
        onStart={handleStartGame}
        starting={starting}
        startError={startError}
      />
      <PlayerList players={state.players} />
    </div>
  );
}
