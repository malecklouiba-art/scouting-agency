import { prisma } from "@/server/db/prisma";
import type { ShortlistStatus } from "@/generated/prisma/client";

export async function getOrCreateDefaultShortlist(organizationId: string, ownerId: string) {
  const existing = await prisma.shortlist.findFirst({ where: { organizationId, ownerId } });
  if (existing) return existing;
  return prisma.shortlist.create({ data: { organizationId, ownerId } });
}

export async function addPlayerToShortlist(params: {
  organizationId: string;
  ownerId: string;
  playerId: string;
  status?: ShortlistStatus;
  note?: string;
}) {
  const shortlist = await getOrCreateDefaultShortlist(params.organizationId, params.ownerId);
  return prisma.shortlistPlayer.upsert({
    where: { shortlistId_playerId: { shortlistId: shortlist.id, playerId: params.playerId } },
    update: { status: params.status, lastNote: params.note },
    create: {
      shortlistId: shortlist.id,
      playerId: params.playerId,
      status: params.status ?? "TO_WATCH",
      lastNote: params.note,
    },
  });
}

export async function removePlayerFromShortlist(params: {
  organizationId: string;
  ownerId: string;
  playerId: string;
}) {
  const shortlist = await getOrCreateDefaultShortlist(params.organizationId, params.ownerId);
  await prisma.shortlistPlayer.deleteMany({ where: { shortlistId: shortlist.id, playerId: params.playerId } });
}

export async function getFollowedPlayerIds(params: {
  organizationId: string;
  ownerId: string;
}): Promise<Set<string>> {
  const shortlist = await prisma.shortlist.findFirst({
    where: { organizationId: params.organizationId, ownerId: params.ownerId },
  });
  if (!shortlist) return new Set();

  const entries = await prisma.shortlistPlayer.findMany({
    where: { shortlistId: shortlist.id },
    select: { playerId: true },
  });
  return new Set(entries.map((entry) => entry.playerId));
}

export async function getShortlistPlayers(params: {
  organizationId: string;
  ownerId: string;
  status?: ShortlistStatus;
}) {
  const shortlist = await getOrCreateDefaultShortlist(params.organizationId, params.ownerId);
  return prisma.shortlistPlayer.findMany({
    where: { shortlistId: shortlist.id, status: params.status },
    include: { player: { include: { club: true } } },
    orderBy: { addedAt: "desc" },
  });
}
