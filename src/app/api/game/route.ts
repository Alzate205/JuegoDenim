// src/app/api/game/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "lib/prisma";
import {
  INITIAL_CASH,
  INITIAL_FINISHED_GOODS,
  INITIAL_RAW_MATERIAL
} from "domain/game/constants";

function generateGameCode(): string {
  return randomBytes(3).toString("hex").toUpperCase(); // ejemplo: "A3F9C2"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const totalWeeks = typeof body.totalWeeks === "number" ? body.totalWeeks : 12;

    const code = generateGameCode();

    const game = await prisma.game.create({
      data: {
        code,
        totalWeeks,
        status: "CONFIGURANDO"
      }
    });

    // Estado financiero inicial (semana 0)
    await prisma.financialState.create({
      data: {
        gameId: game.id,
        week: 0,
        cash: INITIAL_CASH,
        totalDebt: 0,
        interestsPaid: 0,
        weeklyProfit: 0,
        accumulatedProfit: 0
      }
    });

    // Inventario inicial (semana 0)
    await prisma.inventoryState.create({
      data: {
        gameId: game.id,
        week: 0,
        rawMaterialInventory: INITIAL_RAW_MATERIAL,
        finishedGoodsInventory: INITIAL_FINISHED_GOODS
      }
    });

    return NextResponse.json(
      {
        gameId: game.id,
        code: game.code,
        totalWeeks: game.totalWeeks,
        status: game.status
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando partida:", error);
    return NextResponse.json(
      { error: "Error al crear la partida" },
      { status: 500 }
    );
  }
}

// Opcional: listar partidas (simplificado)
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(
      games.map((g) => ({
        id: g.id,
        code: g.code,
        status: g.status,
        currentWeek: g.currentWeek,
        totalWeeks: g.totalWeeks
      }))
    );
  } catch (error) {
    console.error("Error listando partidas:", error);
    return NextResponse.json(
      { error: "Error al listar partidas" },
      { status: 500 }
    );
  }
}
