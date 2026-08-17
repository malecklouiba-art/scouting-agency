import { prisma } from "@/server/db/prisma";
import { DataSource, SyncStatus } from "@/generated/prisma/client";
import { TransfermarktProvider } from "../transfermarkt/transfermarkt.provider";
import type { Player as PlayerDTO, PlayerHistory as PlayerHistoryDTO, Transfer as TransferDTO } from "../types";
import { finishSyncLog, startSyncLog } from "./syncLogger";

export interface SyncResult {
  fetched: number;
  created: number;
  updated: number;
  errors: number;
}

async function resolveClubId(clubSourceId: string | null): Promise<string | null> {
  if (!clubSourceId) return null;
  const club = await prisma.club.upsert({
    where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: clubSourceId } },
    update: {},
    create: { source: DataSource.TRANSFERMARKT, sourceId: clubSourceId, name: `Club ${clubSourceId}` },
  });
  return club.id;
}

async function upsertPlayer(dto: PlayerDTO): Promise<{ id: string; wasCreated: boolean }> {
  const clubId = await resolveClubId(dto.clubSourceId);
  const existing = await prisma.player.findUnique({
    where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: dto.sourceId } },
    select: { id: true },
  });

  const data = {
    source: DataSource.TRANSFERMARKT,
    sourceId: dto.sourceId,
    sourceUrl: dto.sourceUrl,
    lastSyncedAt: new Date(),
    firstName: dto.firstName,
    lastName: dto.lastName,
    dateOfBirth: dto.dateOfBirth,
    nationality: dto.nationality,
    secondaryNationalities: dto.secondaryNationalities,
    heightCm: dto.heightCm,
    preferredFoot: dto.preferredFoot,
    position: dto.position,
    secondaryPositions: dto.secondaryPositions,
    shirtNumber: dto.shirtNumber,
    marketValueEur: dto.marketValueEur,
    photoUrl: dto.photoUrl,
    clubId,
  };

  const player = await prisma.player.upsert({
    where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: dto.sourceId } },
    update: data,
    create: data,
  });

  return { id: player.id, wasCreated: !existing };
}

async function replaceTransfers(playerId: string, transfers: TransferDTO[]): Promise<void> {
  await prisma.transfer.deleteMany({ where: { playerId, source: DataSource.TRANSFERMARKT } });
  if (transfers.length === 0) return;
  await prisma.transfer.createMany({
    data: transfers.map((transfer) => ({
      playerId,
      source: DataSource.TRANSFERMARKT,
      sourceId: transfer.sourceId,
      fromClubName: transfer.fromClubName,
      toClubName: transfer.toClubName,
      date: transfer.date,
      feeEur: transfer.feeEur,
      isLoan: transfer.isLoan,
    })),
  });
}

// Le stats endpoint ne donne qu'un clubId, pas de nom — on résout contre les
// clubs déjà en base (ex: importés via resolveClubId ci-dessus ou syncClubs).
// Un clubId absent de la base laisse simplement clubName à null.
async function resolveClubNames(clubSourceIds: Array<string | null>): Promise<Map<string, string>> {
  const ids = [...new Set(clubSourceIds.filter((id): id is string => id !== null))];
  if (ids.length === 0) return new Map();
  const clubs = await prisma.club.findMany({
    where: { source: DataSource.TRANSFERMARKT, sourceId: { in: ids } },
    select: { sourceId: true, name: true },
  });
  return new Map(clubs.map((club) => [club.sourceId as string, club.name]));
}

async function replaceHistory(playerId: string, history: PlayerHistoryDTO[]): Promise<void> {
  await prisma.playerHistory.deleteMany({ where: { playerId } });
  if (history.length === 0) return;
  const clubNames = await resolveClubNames(history.map((entry) => entry.clubSourceId));
  await prisma.playerHistory.createMany({
    data: history.map((entry) => ({
      playerId,
      season: entry.season,
      clubName: entry.clubSourceId ? (clubNames.get(entry.clubSourceId) ?? null) : null,
      competitionName: entry.competitionName,
      appearances: entry.appearances,
      goals: entry.goals,
      assists: entry.assists,
      minutesPlayed: entry.minutesPlayed,
    })),
  });
}

/**
 * Synchronisation manuelle : recherche par texte puis import complet (profil
 * + transferts + historique) de chaque résultat, jusqu'à `limit` joueurs —
 * un déclenchement via route HTTP doit rester sous le timeout serverless
 * (chaque joueur = 3 appels externes rate-limités en série).
 */
export async function syncPlayers(query: string, triggeredBy: string, limit = 5): Promise<SyncResult> {
  const provider = new TransfermarktProvider();
  const log = await startSyncLog("PLAYER", triggeredBy);

  let fetched = 0;
  let created = 0;
  let updated = 0;
  const errorDetails: Array<{ sourceId?: string; message: string }> = [];

  try {
    const results = (await provider.searchPlayers({ query })).slice(0, limit);

    for (const summary of results) {
      fetched++;
      try {
        const [profile, transfers, history] = await Promise.all([
          provider.getPlayer(summary.sourceId),
          provider.getPlayerTransfers(summary.sourceId),
          provider.getPlayerHistory(summary.sourceId),
        ]);

        if (!profile) {
          errorDetails.push({ sourceId: summary.sourceId, message: "Profil introuvable (404)" });
          continue;
        }

        const { id: playerId, wasCreated } = await upsertPlayer(profile);
        await replaceTransfers(playerId, transfers);
        await replaceHistory(playerId, history);

        if (wasCreated) created++;
        else updated++;
      } catch (error) {
        errorDetails.push({
          sourceId: summary.sourceId,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } finally {
    const status = errorDetails.length > 0 && created + updated === 0 ? SyncStatus.FAILED : SyncStatus.SUCCESS;
    await finishSyncLog(log.id, status, {
      fetched,
      created,
      updated,
      errors: errorDetails.length,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
    });
  }

  return { fetched, created, updated, errors: errorDetails.length };
}
