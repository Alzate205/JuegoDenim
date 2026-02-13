import { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left font-semibold text-slate-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {children}
        </tbody>
      </table>
    </div>
  );
}
