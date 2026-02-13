import { ReactNode } from "react";
import { GameHeader } from "components/layout/GameHeader";
import { GameSidebar } from "components/layout/GameSidebar";

export default function GameLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { code: string };
}) {
  const { code } = params;
  return (
    <div className="grid grid-cols-[260px,1fr] gap-4">
      <div>
        <GameHeader code={code} />
        <GameSidebar code={code} />
      </div>
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
        {children}
      </section>
    </div>
  );
}
