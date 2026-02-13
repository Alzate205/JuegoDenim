interface FinalResultsPanelProps {
  financial: {
    accumulatedProfit: number;
    totalDebt: number;
    cash: number;
  };
}

export function FinalResultsPanel({ financial }: FinalResultsPanelProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 space-y-2">
      <h2 className="text-lg font-semibold text-slate-100">
        Resultados finales de la simulación
      </h2>
      <p className="text-sm text-slate-300">
        Utilidad acumulada:{" "}
        <span className="font-semibold">
          $ {financial.accumulatedProfit.toFixed(0)}
        </span>
      </p>
      <p className="text-sm text-slate-300">
        Caja final:{" "}
        <span className="font-semibold">
          $ {financial.cash.toFixed(0)}
        </span>
      </p>
      <p className="text-sm text-slate-300">
        Deuda pendiente:{" "}
        <span className="font-semibold">
          $ {financial.totalDebt.toFixed(0)}
        </span>
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Estos indicadores pueden utilizarse como base para la evaluación
        del desempeño del equipo y la discusión en clase.
      </p>
    </div>
  );
}
