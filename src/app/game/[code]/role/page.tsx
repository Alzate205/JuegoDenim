"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RoleLayout } from "components/game/role/RoleLayout";
import { RoleHeader } from "components/game/role/RoleHeader";
import { ComprasPanel } from "components/game/role/compras/ComprasPanel";
import { ProduccionPanel } from "components/game/role/produccion/ProduccionPanel";
import { CalidadPanel } from "components/game/role/calidad/CalidadPanel";
import { FinanzasLogisticaPanel } from "components/game/role/finanzasLogistica/FinanzasLogisticaPanel";
import { LoadingSpinner } from "components/common/LoadingSpinner";
import { ErrorMessage } from "components/common/ErrorMessage";
import { Card } from "components/common/Card";
import { Table } from "components/common/Table";
import { Button } from "components/common/Button";

type Role =
  | "COMPRAS"
  | "PRODUCCION"
  | "CALIDAD"
  | "FINANZAS_LOGISTICA";

export default function RolePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = params.code;
  const requestedPlayerId = Number(searchParams.get("playerId"));

  const [playerId, setPlayerId] = useState<number | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [recoveringSession, setRecoveringSession] = useState(false);
  const [hostData, setHostData] = useState<any>(null);
  const [hostError, setHostError] = useState<string | null>(null);
  const [processingRound, setProcessingRound] = useState(false);

  async function fetchHostDecisions() {
    try {
      setHostError(null);
      const res = await fetch(`/api/game/${code}/decisions`, {
        method: "GET",
        cache: "no-store"
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "No se pudieron cargar decisiones.");
      }
      setHostData(json);
    } catch (err: any) {
      setHostError(err.message || "Error al cargar decisiones.");
    }
  }

  async function processCurrentRound() {
    try {
      setProcessingRound(true);
      setHostError(null);

      const res = await fetch(`/api/game/${code}/process-round`, {
        method: "POST"
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "No se pudo procesar la ronda.");
      }

      await fetchHostDecisions();
    } catch (err: any) {
      setHostError(err.message || "Error al procesar la ronda.");
    } finally {
      setProcessingRound(false);
    }
  }

  async function recoverCorrectSession() {
    try {
      setRecoveringSession(true);
      setSecurityError(null);

      const res = await fetch(`/api/game/${code}/state`, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("No se pudo validar la sesión en el servidor.");
      }

      const json = await res.json();
      const serverPlayers: Array<{ id: number; role: Role }> = json.players ?? [];
      const validIds = new Set(serverPlayers.map((p) => p.id));

      const candidateIds: number[] = [];

      const activeRaw = window.localStorage.getItem(
        `denim-factory-active-player-${code}`
      );
      if (activeRaw) {
        const parsedActive = Number(activeRaw);
        if (Number.isInteger(parsedActive) && parsedActive > 0) {
          candidateIds.push(parsedActive);
        }
      }

      const genericRaw = window.localStorage.getItem("denim-factory-player");
      if (genericRaw) {
        try {
          const generic = JSON.parse(genericRaw) as {
            playerId?: number;
            code?: string;
            gameCode?: string;
          };
          const genericCode = generic.code ?? generic.gameCode;
          if (
            genericCode === code &&
            Number.isInteger(generic.playerId) &&
            (generic.playerId as number) > 0
          ) {
            candidateIds.push(generic.playerId as number);
          }
        } catch {
          // ignorar
        }
      }

      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(`denim-factory-player-${code}-`)) {
          continue;
        }
        const value = window.localStorage.getItem(key);
        if (!value) continue;
        try {
          const parsed = JSON.parse(value) as { playerId?: number };
          if (
            Number.isInteger(parsed.playerId) &&
            (parsed.playerId as number) > 0
          ) {
            candidateIds.push(parsed.playerId as number);
          }
        } catch {
          // ignorar
        }
      }

      const firstValid = candidateIds.find((id) => validIds.has(id));

      if (!firstValid) {
        throw new Error(
          "No se encontró una sesión de jugador válida. Vuelva a unirse a la partida."
        );
      }

      window.localStorage.setItem(
        `denim-factory-active-player-${code}`,
        String(firstValid)
      );

      const scoped = window.localStorage.getItem(
        `denim-factory-player-${code}-${firstValid}`
      );
      if (scoped) {
        window.localStorage.setItem("denim-factory-player", scoped);
      }

      router.replace(`/game/${code}/role?playerId=${firstValid}`);
    } catch (err: any) {
      setSecurityError(
        err?.message ||
          "No fue posible recuperar la sesión automáticamente."
      );
    } finally {
      setRecoveringSession(false);
    }
  }

  useEffect(() => {
    async function resolvePlayerContext() {
      setSecurityError(null);
      let resolvedFromQuery = false;
      let resolvedRole: Role | null = null;

      if (Number.isInteger(requestedPlayerId) && requestedPlayerId > 0) {
        const scopedStored = window.localStorage.getItem(
          `denim-factory-player-${code}-${requestedPlayerId}`
        );

        if (scopedStored) {
          try {
            const parsedScoped = JSON.parse(scopedStored) as {
              playerId: number;
              role: Role;
            };
            setPlayerId(parsedScoped.playerId);
            setRole(parsedScoped.role);
            resolvedRole = parsedScoped.role;
            resolvedFromQuery = true;
            window.localStorage.setItem(
              `denim-factory-active-player-${code}`,
              String(parsedScoped.playerId)
            );
          } catch {
            // ignorar
          }
        } else {
          try {
            const res = await fetch(`/api/game/${code}/state`, {
              cache: "no-store"
            });
            if (res.ok) {
              const json = await res.json();
              const player = json.players?.find(
                (p: any) => p.id === requestedPlayerId
              );
              if (player) {
                setPlayerId(player.id);
                setRole(player.role as Role);
                resolvedRole = player.role as Role;
                resolvedFromQuery = true;
                window.localStorage.setItem(
                  `denim-factory-player-${code}-${player.id}`,
                  JSON.stringify({
                    code,
                    gameCode: code,
                    playerId: player.id,
                    role: player.role
                  })
                );
                window.localStorage.setItem(
                  `denim-factory-active-player-${code}`,
                  String(player.id)
                );
              }
            }
          } catch {
            // ignorar
          }
        }
      }

      const stored = window.localStorage.getItem("denim-factory-player");
      if (!resolvedFromQuery && stored) {
        try {
          const parsed = JSON.parse(stored) as {
            playerId: number;
            role: Role;
            code?: string;
            gameCode?: string;
          };
          const storedCode = parsed.code ?? parsed.gameCode;
          if (storedCode === code) {
            setPlayerId(parsed.playerId);
            setRole(parsed.role);
            resolvedRole = parsed.role;
            window.localStorage.setItem(
              `denim-factory-active-player-${code}`,
              String(parsed.playerId)
            );
          }
        } catch {
          // ignorar
        }
      }

      const storedHost = window.localStorage.getItem("denim-factory-host");
      if (storedHost) {
        try {
          const parsedHost = JSON.parse(storedHost) as {
            code?: string;
            isHost?: boolean;
          };
          if (parsedHost.code === code && parsedHost.isHost) {
            setIsHost(true);
          }
        } catch {
          // ignorar
        }
      }

      if (Number.isInteger(requestedPlayerId) && requestedPlayerId > 0) {
        try {
          const res = await fetch(`/api/game/${code}/state`, {
            cache: "no-store"
          });

          if (res.ok) {
            const json = await res.json();
            const serverPlayer = json.players?.find(
              (p: any) => p.id === requestedPlayerId
            );

            if (!serverPlayer) {
              setSecurityError(
                "El jugador indicado en la URL no pertenece a esta partida."
              );
            } else {
              if (resolvedRole && serverPlayer.role !== resolvedRole) {
                setSecurityError(
                  "Inconsistencia detectada entre playerId y rol. Recargue desde su enlace de jugador."
                );
              }

              // Sincronizar siempre el rol con la fuente real (servidor)
              setPlayerId(serverPlayer.id);
              setRole(serverPlayer.role as Role);
            }
          }
        } catch {
          // ignorar en modo offline temporal
        }
      }

      setLoading(false);
    }

    resolvePlayerContext();
  }, [code, requestedPlayerId]);

  useEffect(() => {
    if (!isHost) return;

    fetchHostDecisions();
    const interval = setInterval(fetchHostDecisions, 3000);
    return () => clearInterval(interval);
  }, [isHost, code]);

  if (loading) {
    return <LoadingSpinner message="Cargando panel de rol..." />;
  }

  if (securityError) {
    return (
      <div className="space-y-3">
        <ErrorMessage message={securityError} />
        <div>
          <Button onClick={recoverCorrectSession} disabled={recoveringSession}>
            {recoveringSession
              ? "Recuperando sesión..."
              : "Recuperar sesión correcta"}
          </Button>
        </div>
      </div>
    );
  }

  if (!playerId || !role) {
    if (isHost) {
      return (
        <RoleLayout>
          <Card title="Panel de control del administrador">
            <p className="text-sm text-slate-300 mb-3">
              Desde aquí puede ver qué decisiones envió cada rol y avanzar la semana cuando todos estén listos.
            </p>

            {hostError && (
              <ErrorMessage message={hostError} />
            )}

            {!hostData ? (
              <LoadingSpinner message="Cargando decisiones de la semana..." />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Semana actual: {hostData.week}</span>
                  <span>
                    Decisiones enviadas: {hostData.submittedCount}/{hostData.playersCount}
                  </span>
                </div>

                <Table headers={["Jugador", "Rol", "Estado"]}>
                  {hostData.players.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-slate-100">{p.name}</td>
                      <td className="px-3 py-2 text-slate-300">{p.role}</td>
                      <td className="px-3 py-2">
                        <span
                          className={p.submitted ? "text-emerald-400" : "text-amber-400"}
                        >
                          {p.submitted ? "Listo" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Table>

                <Card title="Resumen de decisiones enviadas">
                  <Table headers={["Jugador", "Tipo", "Datos"]}>
                    {hostData.decisions.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-slate-400 text-center">
                          Aún no hay decisiones registradas esta semana.
                        </td>
                      </tr>
                    )}
                    {hostData.decisions.map((d: any) => (
                      <tr key={d.id}>
                        <td className="px-3 py-2 text-slate-100">{d.playerName}</td>
                        <td className="px-3 py-2 text-slate-300">{d.type}</td>
                        <td className="px-3 py-2 text-slate-300 text-xs max-w-[420px] truncate" title={JSON.stringify(d.data)}>
                          {JSON.stringify(d.data)}
                        </td>
                      </tr>
                    ))}
                  </Table>
                </Card>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={fetchHostDecisions}>
                    Actualizar
                  </Button>
                  <Button
                    onClick={processCurrentRound}
                    disabled={
                      processingRound ||
                      !hostData.allPlayersDecided ||
                      hostData.gameStatus !== "EN_CURSO"
                    }
                  >
                    {processingRound ? "Procesando..." : "Avanzar semana"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </RoleLayout>
      );
    }

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
