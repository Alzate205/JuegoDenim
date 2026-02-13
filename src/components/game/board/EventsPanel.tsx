interface EventsPanelProps {
  events: any[];
}

export function EventsPanel({ events }: EventsPanelProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
      <h3 className="text-sm font-semibold mb-2">Eventos activos</h3>
      {events.length === 0 ? (
        <p className="text-xs text-slate-500">
          No hay eventos especiales en esta semana.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="border border-slate-700 rounded-xl px-3 py-2"
            >
              <p className="text-xs text-slate-400 mb-1">
                Tipo: {ev.type}
              </p>
              <p className="text-slate-100">{ev.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
