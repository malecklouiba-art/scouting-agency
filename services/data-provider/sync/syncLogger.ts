import { prisma } from "@/server/db/prisma";
import { SyncStatus, type SyncEntity } from "@/generated/prisma/client";

export interface SyncCounters {
  fetched: number;
  created: number;
  updated: number;
  errors: number;
  errorDetails?: unknown;
}

export async function startSyncLog(entity: SyncEntity, triggeredBy: string) {
  return prisma.syncLog.create({ data: { entity, triggeredBy } });
}

export async function finishSyncLog(id: string, status: SyncStatus, counters: SyncCounters) {
  return prisma.syncLog.update({
    where: { id },
    data: {
      status,
      finishedAt: new Date(),
      fetched: counters.fetched,
      created: counters.created,
      updated: counters.updated,
      errors: counters.errors,
      errorDetails: counters.errorDetails === undefined ? undefined : (counters.errorDetails as object),
    },
  });
}
