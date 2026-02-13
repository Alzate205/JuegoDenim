"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface GameSidebarProps {
  code: string;
}

const links = [
  { href: (code: string) => `/game/${code}/lobby`, label: "Lobby" },
  { href: (code: string) => `/game/${code}/board`, label: "Tablero general" },
  { href: (code: string) => `/game/${code}/role`, label: "Panel de rol" }
];

export function GameSidebar({ code }: GameSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const url = link.href(code);
        const active = pathname.startsWith(url);
        return (
          <Link
            key={link.label}
            href={url}
            className={`block px-3 py-2 rounded-xl text-sm font-medium ${
              active
                ? "bg-accent text-white"
                : "bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
