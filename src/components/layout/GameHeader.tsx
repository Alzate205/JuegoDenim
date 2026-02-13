interface GameHeaderProps {
  code: string;
}

export function GameHeader({ code }: GameHeaderProps) {
  return (
    <div className="mb-4 bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3">
      <p className="text-xs text-slate-400 mb-1">Código de sala</p>
      <p className="text-lg font-semibold tracking-widest">{code}</p>
    </div>
  );
}
