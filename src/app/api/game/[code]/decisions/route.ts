// src/app/api/game/[code]/decisions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { validateDecisionForRole } from "domain/game/validation";
import type { Role as DomainRole } from "domain/game/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { playerId, type, data } = await req.json();

    if (!playerId || !type) {
      return NextResponse.json(
        { error: "playerId y type son obligatorios." },
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

    if (game.status !== "EN_CURSO") {
      return NextResponse.json(
        { error: "La partida no está en curso." },
        { status: 400 }
      );
    }

    const player = game.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json(
        { error: "Jugador no pertenece a esta partida." },
        { status: 400 }
      );
    }

    // Validar que el tipo de decisión corresponda con el rol
    const role = player.role as DomainRole;
    const decisionPayload = {
      type,
      ...data
    };

    const parsedDecision = validateDecisionForRole(role, decisionPayload);

    // Guardar o reemplazar decisión de ese jugador en esa semana
    const week = game.currentWeek;

    const existing = await prisma.decision.findFirst({
      where: {
        gameId: game.id,
        playerId: player.id,
        week
      }
    });

    if (existing) {
      await prisma.decision.update({
        where: { id: existing.id },
        data: {
          type: parsedDecision.type,
          dataJson: JSON.stringify(parsedDecision)
        }
      });
    } else {
      await prisma.decision.create({
        data: {
          gameId: game.id,
          playerId: player.id,
          week,
          type: parsedDecision.type,
          dataJson: JSON.stringify(parsedDecision)
        }
      });
    }

    // Comprobar si ya tenemos decisiones de los 4 jugadores
    const decisionsThisWeek = await prisma.decision.findMany({
      where: { gameId: game.id, week }
    });

    const uniquePlayerIds = new Set(decisionsThisWeek.map((d) => d.playerId));
    const allPlayersDecided = uniquePlayerIds.size >= game.players.length && game.players.length === 4;

    return NextResponse.json({
      ok: true,
      allPlayersDecided
    });
  } catch (error) {
    console.error("Error guardando decisión:", error);
    return NextResponse.json(
      { error: "Error al guardar la decisión" },
      { status: 500 }
    );
  }
}
