import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
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

    if (game.status !== "CONFIGURANDO") {
      return NextResponse.json(
        { error: "La partida ya fue iniciada o finalizada." },
        { status: 400 }
      );
    }

    if (game.players.length < 4) {
      return NextResponse.json(
        {
          error:
            "Aún no están listos todos los roles. Se requieren 4 jugadores para iniciar."
        },
        { status: 400 }
      );
    }

    const updated = await prisma.game.update({
      where: { id: game.id },
      data: { status: "EN_CURSO" }
    });

    return NextResponse.json({
      ok: true,
      game: {
        id: updated.id,
        code: updated.code,
        status: updated.status,
        currentWeek: updated.currentWeek,
        totalWeeks: updated.totalWeeks
      }
    });
  } catch (error) {
    console.error("Error al iniciar partida:", error);
    return NextResponse.json(
      { error: "Error al iniciar la partida" },
      { status: 500 }
    );
  }
}
