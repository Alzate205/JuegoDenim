// src/app/api/game/[code]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

// Roles permitidos en la aplicación
const validRoles = [
  "COMPRAS",
  "PRODUCCION",
  "CALIDAD",
  "FINANZAS_LOGISTICA"
] as const;

type Role = (typeof validRoles)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body = await req.json();
    const name = body.name as string;
    const role = body.role as Role;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rol inválido." },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { code: params.code },
      include: { players: true }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Partida no encontrada." },
        { status: 404 }
      );
    }

    if (game.status !== "CONFIGURANDO" && game.status !== "EN_CURSO") {
      return NextResponse.json(
        { error: "La partida no admite nuevos jugadores." },
        { status: 400 }
      );
    }

    if (game.players.length >= 4) {
      return NextResponse.json(
        { error: "La partida ya tiene 4 jugadores." },
        { status: 400 }
      );
    }

    const roleTaken = game.players.some((p) => p.role === role);
    if (roleTaken) {
      return NextResponse.json(
        { error: "Ese rol ya está tomado en esta partida." },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name,
        role,
        gameId: game.id
      }
    });

    return NextResponse.json(
      {
        playerId: player.id,
        role: player.role,
        gameId: game.id,
        code: game.code
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al unirse a partida:", error);
    return NextResponse.json(
      { error: "Error al unirse a la partida" },
      { status: 500 }
    );
  }
}
