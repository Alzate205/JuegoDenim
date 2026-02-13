import { Button } from "components/common/Button";

interface LobbyStatusProps {
  status: string;
  playersCount: number;
  totalPlayersRequired: number;
  isHost: boolean;
  onStart: () => void;
  starting: boolean;
  startError: string | null;
}

export function LobbyStatus({
  status,
  playersCount,
  totalPlayersRequired,
  isHost,
  onStart,
  starting,
  startError
}: LobbyStatusProps) {
  const rolesReady = playersCount >= totalPlayersRequired;
  const canHostStart = isHost && status === "CONFIGURANDO" && rolesReady;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400">Estado de la partida</p>
        <p className="text-sm font-semibold text-slate-100">
          {status === "CONFIGURANDO" && "Configurando jugadores"}
          {status === "EN_CURSO" && "En curso"}
          {status === "FINALIZADA" && "Finalizada"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">Jugadores conectados</p>
        <p className="text-sm font-semibold text-slate-100">
          {playersCount} / {totalPlayersRequired}
        </p>
        {rolesReady && status === "CONFIGURANDO" && (
          <p className="text-xs text-amber-400 mt-1">
            Roles listos. Esperando que el creador inicie la partida.
          </p>
        )}
        {status === "EN_CURSO" && (
          <p className="text-xs text-emerald-400 mt-1">
            Partida iniciada. Ya pueden jugar la semana actual.
          </p>
        )}
        {canHostStart && (
          <div className="mt-2 flex justify-end">
            <Button onClick={onStart} disabled={starting}>
              {starting ? "Iniciando..." : "Iniciar partida"}
            </Button>
          </div>
        )}
        {startError && (
          <p className="text-xs text-red-300 mt-1">{startError}</p>
        )}
      </div>
    </div>
  );
}
