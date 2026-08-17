import { prisma } from "@/server/db/prisma";
import { DataSource, SyncStatus } from "@/generated/prisma/client";
import { TransfermarktProvider } from "../transfermarkt/transfermarkt.provider";
import { finishSyncLog, startSyncLog } from "./syncLogger";
import type { SyncResult } from "./syncPlayers";

/** Recherche par texte puis upsert des clubs trouvés (enrichit les stubs créés par syncPlayers), jusqu'à `limit` résultats. */
export async function syncClubs(query: string, triggeredBy: string, limit = 20): Promise<SyncResult> {
  const provider = new TransfermarktProvider();
  const log = await startSyncLog("CLUB", triggeredBy);

  let fetched = 0;
  let created = 0;
  let updated = 0;
  const errorDetails: Array<{ sourceId?: string; message: string }> = [];

  try {
    const results = (await provider.searchClubs({ query })).slice(0, limit);

    for (const club of results) {
      fetched++;
      try {
        const existing = await prisma.club.findUnique({
          where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: club.sourceId } },
          select: { id: true },
        });

        await prisma.club.upsert({
          where: { source_sourceId: { source: DataSource.TRANSFERMARKT, sourceId: club.sourceId } },
          update: { name: club.name, country: club.country, lastSyncedAt: new Date() },
          create: {
            source: DataSource.TRANSFERMARKT,
            sourceId: club.sourceId,
            name: club.name,
            country: club.country,
            lastSyncedAt: new Date(),
          },
        });

        if (existing) updated++;
        else created++;
      } catch (error) {
        errorDetails.push({
          sourceId: club.sourceId,
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
