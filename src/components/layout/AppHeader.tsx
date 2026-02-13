import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center text-xs font-bold">
            DF
          </div>
          <div>
            <p className="text-sm font-semibold">Denim Factory</p>
            <p className="text-xs text-slate-400">
              Simulador de logística y producción
            </p>
          </div>
        </Link>
        <span className="text-xs text-slate-500">
          Proyecto académico – Universidad
        </span>
      </div>
    </header>
  );
}
