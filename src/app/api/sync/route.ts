import { getCurrentUser } from "@/server/auth/current-user";
import { syncClubs } from "@data-provider/sync/syncClubs";
import { syncCompetitions } from "@data-provider/sync/syncCompetitions";
import { syncPlayers } from "@data-provider/sync/syncPlayers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYNC_BY_ENTITY = {
  players: syncPlayers,
  clubs: syncClubs,
  competitions: syncCompetitions,
} as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
  }

  const body = await request.json();
  const entity = body?.entity;
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!(entity in SYNC_BY_ENTITY) || !query) {
    return NextResponse.json(
      { error: `entity doit être l'un de: ${Object.keys(SYNC_BY_ENTITY).join(", ")}, query requis` },
      { status: 400 },
    );
  }

  const limit = typeof body?.limit === "number" ? Math.min(body.limit, 20) : undefined;
  const sync = SYNC_BY_ENTITY[entity as keyof typeof SYNC_BY_ENTITY];
  const result = limit === undefined ? await sync(query, user.id) : await sync(query, user.id, limit);

  return NextResponse.json(result);
}
