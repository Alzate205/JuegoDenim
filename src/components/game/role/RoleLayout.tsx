import { ReactNode } from "react";

export function RoleLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
