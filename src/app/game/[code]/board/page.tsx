"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


import { Timeline } from "components/game/board/Timeline";
import { VisualBoard } from "components/game/board/VisualBoard";
import { GameSummaryPanel } from "components/game/board/GameSummaryPanel";
import { EventsPanel } from "components/game/board/EventsPanel";
import { LoadingSpinner } from "components/common/LoadingSpinner";
import { ErrorMessage } from "components/common/ErrorMessage";
import { ComprasPanel } from "components/game/role/compras/ComprasPanel";
import { ProduccionPanel } from "components/game/role/produccion/ProduccionPanel";
import { CalidadPanel } from "components/game/role/calidad/CalidadPanel";
import { FinanzasLogisticaPanel } from "components/game/role/finanzasLogistica/FinanzasLogisticaPanel";
import { useSearchParams } from "next/navigation";

export default function BoardPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const searchParams = useSearchParams();

  // All hooks at the top
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDecision, setShowDecision] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [manualRole, setManualRole] = useState<string>("COMPRAS");
  const [manualPlayerId, setManualPlayerId] = useState<number>(1);

  // Fetch state and detect player/role
  const fetchState = async () => {
    setLoading(true);
    setError(null);
    try {
      let resolved = false;
      // Try to get playerId/role from query params
      let requestedPlayerId = Number(searchParams.get("playerId"));
      if (Number.isInteger(requestedPlayerId) && requestedPlayerId > 0) {
        const scopedStored = typeof window !== "undefined" ? window.localStorage.getItem(
          `denim-factory-player-${code}-${requestedPlayerId}`
        ) : null;
        if (scopedStored) {
          try {
            const parsed = JSON.parse(scopedStored);
            setPlayerId(parsed.playerId);
            setRole(parsed.role);
            resolved = true;
          } catch {}
        }
      }
      if (!resolved && typeof window !== "undefined") {
        const stored = window.localStorage.getItem("denim-factory-player");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if ((parsed.code ?? parsed.gameCode) === code) {
              setPlayerId(parsed.playerId);
              setRole(parsed.role);
            }
          } catch {}
        }
      }
      const res = await fetch(`/api/game/${code}/state`, {
        method: "GET",
        cache: "no-store"
      });
      if (!res.ok) {
        throw new Error("No se pudo cargar el estado de la partida.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Error desconocido al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (loading && !data) {
    return <LoadingSpinner message="Cargando tablero general..." />;
  }

  if (error || !data) {
    return (
      <ErrorMessage
        message={error ?? "No se pudo obtener la información del tablero."}
      />
    );
  }

  const game = data.game;
  const { inventory, financial, pendingOrders, eventsActive } = data;

  // Selector manual de rol/playerId si no hay sesión detectada
  let effectiveRole = role || manualRole;
  let effectivePlayerId = playerId || manualPlayerId;

  let decisionPanel = null;
  if (effectivePlayerId && effectiveRole) {
    switch (effectiveRole) {
      case "COMPRAS":
        decisionPanel = <ComprasPanel gameCode={code} playerId={effectivePlayerId} />;
        break;
      case "PRODUCCION":
        decisionPanel = <ProduccionPanel gameCode={code} playerId={effectivePlayerId} />;
        break;
      case "CALIDAD":
        decisionPanel = <CalidadPanel gameCode={code} playerId={effectivePlayerId} />;
        break;
      case "FINANZAS_LOGISTICA":
        decisionPanel = <FinanzasLogisticaPanel gameCode={code} playerId={effectivePlayerId} />;
        break;
    }
  }

  return (
    <div className="space-y-6 p-4 relative">
      <div className="flex items-center justify-between gap-4">
        <Timeline
          currentWeek={game.currentWeek}
          totalWeeks={game.totalWeeks}
        />
        <button
          onClick={fetchState}
          className="text-xs px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
        >
          Actualizar estado
        </button>
      </div>

      <VisualBoard
        currentWeek={game.currentWeek}
        inventory={inventory}
        pendingOrders={pendingOrders}
      />

      <GameSummaryPanel
        inventory={inventory}
        financial={financial}
        pendingOrders={pendingOrders}
      />

      <EventsPanel events={eventsActive ?? []} />

      {/* Botón flotante para abrir el panel de decisiones */}
      {(!playerId || !role) && (
        <div className="fixed bottom-8 left-8 z-40 bg-gradient-to-br from-blue-900/90 to-slate-800/90 p-5 rounded-2xl border-2 border-blue-700 shadow-2xl flex flex-col gap-3 min-w-[220px] max-w-xs">
          <span className="text-xs text-blue-200 font-semibold mb-1 tracking-wide">Selector de rol y jugador</span>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-100 font-medium">
              Rol:
              <select value={manualRole} onChange={e => setManualRole(e.target.value)} className="px-2 py-1 rounded-lg bg-slate-900 border border-blue-700 text-slate-100 focus:ring-2 focus:ring-blue-400">
                <option value="COMPRAS">Compras</option>
                <option value="PRODUCCION">Producción</option>
                <option value="CALIDAD">Calidad</option>
                <option value="FINANZAS_LOGISTICA">Finanzas/Logística</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-100 font-medium">
              PlayerId:
              <input type="number" min={1} value={manualPlayerId} onChange={e => setManualPlayerId(Number(e.target.value) || 1)} className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-blue-700 text-slate-100 focus:ring-2 focus:ring-blue-400" />
            </label>
          </div>
          <span className="text-[10px] text-blue-300 mt-1">* Solo visible si no hay sesión detectada</span>
        </div>
      )}
      {decisionPanel && (
        <>
          <button
            onClick={() => setShowDecision(true)}
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full shadow-2xl px-8 py-4 text-lg font-extrabold tracking-wide border-2 border-blue-400 transition-all duration-200 animate-bounce-slow"
            style={{ boxShadow: "0 6px 32px 0 rgba(30,64,175,0.25)" }}
          >
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4V7m0 0V5a2 2 0 10-4 0v2m0 0v2a2 2 0 104 0V7" /></svg>
              Tomar decisión
            </span>
          </button>
          {showDecision && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full relative shadow-2xl border border-slate-700">
                <button
                  onClick={() => setShowDecision(false)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 text-2xl font-bold"
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <h2 className="text-xl font-semibold mb-4 text-slate-100 text-center">Panel de decisiones ({effectiveRole})</h2>
                {decisionPanel}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
