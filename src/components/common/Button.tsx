"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950";
  const variants: Record<string, string> = {
    primary:
      "bg-accent text-white hover:bg-accent-soft focus:ring-accent",
    secondary:
      "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-600",
    ghost:
      "bg-transparent text-slate-100 hover:bg-slate-800 focus:ring-slate-600"
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
