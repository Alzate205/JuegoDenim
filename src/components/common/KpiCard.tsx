interface KpiCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export function KpiCard({ label, value, helper }: KpiCardProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-slate-50">{value}</p>
      {helper && (
        <p className="text-xs text-slate-500 mt-1">{helper}</p>
      )}
    </div>
  );
}
