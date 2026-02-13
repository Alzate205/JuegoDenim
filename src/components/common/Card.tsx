import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
      {title && (
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
