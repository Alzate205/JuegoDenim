import { KpiCard } from "components/common/KpiCard";
import { Table } from "components/common/Table";

interface GameSummaryPanelProps {
  inventory: {
    week: number;
    rawMaterial: number;
    finishedGoods: number;
  } | null;
  financial: {
    week: number;
    cash: number;
    totalDebt: number;
    interestsPaid: number;
    weeklyProfit: number;
    accumulatedProfit: number;
  } | null;
  pendingOrders: any[];
}

export function GameSummaryPanel({
  inventory,
  financial,
  pendingOrders
}: GameSummaryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <KpiCard
          label="Caja"
          value={financial ? `$ ${financial.cash.toFixed(0)}` : "-"}
          helper="Disponibilidad de efectivo"
        />
        <KpiCard
          label="Deuda total"
          value={financial ? `$ ${financial.totalDebt.toFixed(0)}` : "-"}
        />
        <KpiCard
          label="Utilidad semana"
          value={
            financial ? `$ ${financial.weeklyProfit.toFixed(0)}` : "-"
          }
        />
        <KpiCard
          label="Utilidad acumulada"
          value={
            financial
              ? `$ ${financial.accumulatedProfit.toFixed(0)}`
              : "-"
          }
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
          <h3 className="text-sm font-semibold mb-2">Inventarios</h3>
          {inventory ? (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-300">Materia prima</dt>
                <dd className="text-slate-100">
                  {inventory.rawMaterial} unidades
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Producto terminado</dt>
                <dd className="text-slate-100">
                  {inventory.finishedGoods} unidades
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-xs text-slate-500">
              No hay datos de inventario.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">
            Pedidos pendientes
          </h3>
          <Table headers={["ID", "Semana entrega", "Cantidad", "Estado"]}>
            {pendingOrders.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-3 text-xs text-slate-500 text-center"
                >
                  No hay pedidos pendientes.
                </td>
              </tr>
            )}
            {pendingOrders.map((o: any) => (
              <tr key={o.id}>
                <td className="px-3 py-2 text-slate-100">{o.id}</td>
                <td className="px-3 py-2 text-slate-300">
                  {o.dueWeek}
                </td>
                <td className="px-3 py-2 text-slate-300">
                  {o.quantity}
                </td>
                <td className="px-3 py-2 text-slate-300">{o.status}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}
