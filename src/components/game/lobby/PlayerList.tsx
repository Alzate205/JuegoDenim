import { Table } from "components/common/Table";

interface Player {
  id: number;
  name: string;
  role: string;
}

interface PlayerListProps {
  players: Player[];
}

const roleLabels: Record<string, string> = {
  COMPRAS: "Compras",
  PRODUCCION: "Producción",
  CALIDAD: "Calidad",
  FINANZAS_LOGISTICA: "Finanzas y logística"
};

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-2 text-slate-200">
        Jugadores conectados
      </h2>
      <Table headers={["Nombre", "Rol"]}>
        {players.map((p) => (
          <tr key={p.id}>
            <td className="px-3 py-2 text-slate-100">{p.name}</td>
            <td className="px-3 py-2 text-slate-300">
              {roleLabels[p.role] ?? p.role}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
