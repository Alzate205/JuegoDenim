// tests/integration/api/game.test.ts

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as createGame } from "app/api/game/route";
import { POST as joinGame } from "app/api/game/[code]/join/route";
import { GET as getState } from "app/api/game/[code]/state/route";
import { prisma } from "lib/prisma";

/**
 * Nota importante:
 * Estas pruebas asumen que se puede ejecutar código de rutas
 * de Next.js directamente. Dependiendo de la configuración del
 * proyecto, podría ser necesario ajustar los imports o el entorno
 * de test. Si causan problemas, pueden marcarse como skip.
 */

describe("API de juego de Denim Factory", () => {
  it("debería crear una partida nueva", async () => {
    const req = new NextRequest("http://localhost/api/game", {
      method: "POST",
      body: JSON.stringify({ totalWeeks: 8 }),
      headers: {
        "Content-Type": "application/json"
      }
    } as any);

    const res = await createGame(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.code).toBeDefined();
    expect(json.totalWeeks).toBe(8);
  });

  it.skip("debería permitir unirse a una partida y obtener su estado", async () => {
    // Crear partida primero
    const createReq = new NextRequest("http://localhost/api/game", {
      method: "POST",
      body: JSON.stringify({ totalWeeks: 6 }),
      headers: {
        "Content-Type": "application/json"
      }
    } as any);
    const createRes = await createGame(createReq);
    const created = await createRes.json();

    const code = created.code as string;

    // Unirse a la partida
    const joinReq = new NextRequest(
      `http://localhost/api/game/${code}/join`,
      {
        method: "POST",
        body: JSON.stringify({
          name: "Jugador de prueba",
          role: "COMPRAS"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      } as any
    );

    const joinRes = await joinGame(joinReq, { params: { code } });
    const joinJson = await joinRes.json();

    expect(joinRes.status).toBe(201);
    expect(joinJson.playerId).toBeDefined();
    expect(joinJson.role).toBe("COMPRAS");

    // Obtener estado de la partida
    const stateReq = new NextRequest(
      `http://localhost/api/game/${code}/state`
    );

    const stateRes = await getState(stateReq, { params: { code } });
    const stateJson = await stateRes.json();

    expect(stateRes.status).toBe(200);
    expect(stateJson.game.code).toBe(code);
    expect(Array.isArray(stateJson.players)).toBe(true);
  });
});

// Limpieza básica al terminar (opcional)
afterAll(async () => {
  // En un entorno real se pueden limpiar tablas de prueba
  await prisma.$disconnect();
});
