interface TimelineProps {
  currentWeek: number;
  totalWeeks: number;
}

export function Timeline({ currentWeek, totalWeeks }: TimelineProps) {
  const progress = Math.min(
    100,
    (currentWeek / Math.max(totalWeeks, 1)) * 100
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between mb-2 text-xs text-slate-300">
        <span>Semana {currentWeek}</span>
        <span>de {totalWeeks}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
