import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "components/layout/AppHeader";
import { AppFooter } from "components/layout/AppFooter";

export const metadata: Metadata = {
  title: "Denim Factory - Simulador de logística",
  description:
    "Simulador educativo de logística y producción de jeans para uso universitario."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
