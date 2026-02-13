interface LobbyStatusProps {
  status: string;
  playersCount: number;
  totalPlayersRequired: number;
}

export function LobbyStatus({
  status,
  playersCount,
  totalPlayersRequired
}: LobbyStatusProps) {
  const ready = playersCount >= totalPlayersRequired && status === "EN_CURSO";

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
        {ready && (
          <p className="text-xs text-emerald-400 mt-1">
            Todos los roles asignados. El profesor puede iniciar la
            simulación.
          </p>
        )}
      </div>
    </div>
  );
}
