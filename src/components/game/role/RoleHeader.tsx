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

export function RoleHeader({ role }: { role: Role }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
      <h2 className="text-lg font-semibold text-slate-100">
        {roleTitles[role]}
      </h2>
      <p className="text-xs text-slate-400 mt-1">
        Configure las decisiones de su área para la semana actual.
      </p>
    </div>
  );
}
