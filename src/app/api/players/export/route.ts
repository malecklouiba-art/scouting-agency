import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { playersToCsv } from "@/server/services/player-csv.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  }

  const players = await prisma.player.findMany({
    include: { club: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const csv = playersToCsv(players);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="scoutpro-joueurs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
