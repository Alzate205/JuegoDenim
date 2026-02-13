"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoleLayout } from "components/game/role/RoleLayout";
import { RoleHeader } from "components/game/role/RoleHeader";
import { ComprasPanel } from "components/game/role/compras/ComprasPanel";
import { ProduccionPanel } from "components/game/role/produccion/ProduccionPanel";
import { CalidadPanel } from "components/game/role/calidad/CalidadPanel";
import { FinanzasLogisticaPanel } from "components/game/role/finanzasLogistica/FinanzasLogisticaPanel";
import { LoadingSpinner } from "components/common/LoadingSpinner";
import { ErrorMessage } from "components/common/ErrorMessage";

type Role =
  | "COMPRAS"
  | "PRODUCCION"
  | "CALIDAD"
  | "FINANZAS_LOGISTICA";

export default function RolePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [playerId, setPlayerId] = useState<number | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("denim-factory-player");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          playerId: number;
          role: Role;
          code: string;
        };
        if (parsed.code === code) {
          setPlayerId(parsed.playerId);
          setRole(parsed.role);
        }
      } catch {
        // ignorar
      }
    }
    setLoading(false);
  }, [code]);

  if (loading) {
    return <LoadingSpinner message="Cargando panel de rol..." />;
  }

  if (!playerId || !role) {
    return (
      <ErrorMessage message="No se encontró información del jugador. Vuelva a unirse a la partida desde la página principal." />
    );
  }

  let panel = null;
  switch (role) {
    case "COMPRAS":
      panel = <ComprasPanel gameCode={code} playerId={playerId} />;
      break;
    case "PRODUCCION":
      panel = <ProduccionPanel gameCode={code} playerId={playerId} />;
      break;
    case "CALIDAD":
      panel = <CalidadPanel gameCode={code} playerId={playerId} />;
      break;
    case "FINANZAS_LOGISTICA":
      panel = (
        <FinanzasLogisticaPanel gameCode={code} playerId={playerId} />
      );
      break;
  }

  return (
    <RoleLayout>
      <RoleHeader role={role} />
      {panel}
    </RoleLayout>
  );
}
