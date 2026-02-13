// src/app/api/game/[code]/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { code: params.code }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Partida no encontrada." },
        { status: 404 }
      );
    }

    const events = await prisma.gameEvent.findMany({
      where: { gameId: game.id },
      orderBy: { startWeek: "asc" }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return NextResponse.json(
      { error: "Error al obtener los eventos" },
      { status: 500 }
    );
  }
}

/**
 * Crear evento manualmente (por ejemplo, desde una herramienta de profesor).
 * Body esperado:
 * {
 *   "type": "operativo" | "demanda" | "financiero" | "logistico",
 *   "description": "texto",
 *   "startWeek": number,
 *   "endWeek": number,
 *   "effects": { ... }
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body = await req.json();
    const { type, description, startWeek, endWeek, effects } = body;

    if (!type || !description || typeof startWeek !== "number" || typeof endWeek !== "number") {
      return NextResponse.json(
        { error: "Datos incompletos para crear el evento." },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { code: params.code }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Partida no encontrada." },
        { status: 404 }
      );
    }

    const created = await prisma.gameEvent.create({
      data: {
        gameId: game.id,
        type,
        description,
        startWeek,
        endWeek,
        effectsJson: JSON.stringify(effects ?? {})
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creando evento:", error);
    return NextResponse.json(
      { error: "Error al crear el evento" },
      { status: 500 }
    );
  }
}
