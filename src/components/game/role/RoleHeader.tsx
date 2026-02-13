type Role =
  | "COMPRAS"
  | "PRODUCCION"
  | "CALIDAD"
  | "FINANZAS_LOGISTICA";

const roleTitles: Record<Role, string> = {
  COMPRAS: "Panel de Compras y Abastecimiento",
  PRODUCCION: "Panel de Producción",
  CALIDAD: "Panel de Calidad",
  FINANZAS_LOGISTICA: "Panel de Finanzas y Logística"
};

const roleHints: Record<Role, string> = {
  COMPRAS:
    "Define órdenes de materia prima y estrategia del minijuego de negociación para impactar costos e inventario futuro.",
  PRODUCCION:
    "Planifica producción, horas extra y estrategia operativa para balancear capacidad, costo y defectos.",
  CALIDAD:
    "Ajusta inspección y minijuego de control para reducir defectos sin disparar costos.",
  FINANZAS_LOGISTICA:
    "Configura préstamos, prioridad de despachos y minijuego logístico para mejorar flujo de caja y cumplimiento."
};

export function RoleHeader({ role }: { role: Role }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
      <h2 className="text-lg font-semibold text-slate-100">
        {roleTitles[role]}
      </h2>
      <p className="text-xs text-slate-400 mt-1">
        {roleHints[role]}
      </p>
    </div>
  );
}
