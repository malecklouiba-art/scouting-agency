import { prisma } from "@/server/db/prisma";
import { DataSource, SyncStatus } from "@/generated/prisma/client";
import { TransfermarktProvider } from "../transfermarkt/transfermarkt.provider";
import { finishSyncLog, startSyncLog } from "./syncLogger";
import type { SyncResult } from "./syncPlayers";

/** Recherche par texte puis upsert des compétitions trouvées, jusqu'à `limit` résultats. */
export async function syncCompetitions(query: string, triggeredBy: string, limit = 20): Promise<SyncResult> {
  const provider = new TransfermarktProvider();
  const log = await startSyncLog("COMPETITION", triggeredBy);

  let fetched = 0;
  let created = 0;
  let updated = 0;
  const errorDetails: Array<{ sourceId?: string; message: string }> = [];

  try {
    const results = (await provider.searchCompetitions({ query })).slice(0, limit);

    for (const competition of results) {
      fetched++;
      try {
        const existing = await prisma.competition.findUnique({
          where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: competition.sourceId } },
          select: { id: true },
        });

        await prisma.competition.upsert({
          where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: competition.sourceId } },
          update: { name: competition.name, country: competition.country, lastSyncedAt: new Date() },
          create: {
            source: DataSource.TRANSFERMARKT,
            sourceId: competition.sourceId,
            name: competition.name,
            country: competition.country,
            lastSyncedAt: new Date(),
          },
        });

        if (existing) updated++;
        else created++;
      } catch (error) {
        errorDetails.push({
          sourceId: competition.sourceId,
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
