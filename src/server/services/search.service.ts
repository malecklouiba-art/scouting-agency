import { prisma } from "@/server/db/prisma";
import type { Foot } from "@/generated/prisma/client";
import { scorePlayer } from "./scoring.service";

/** Critères structurés — position attendue en code interne (voir src/lib/positions.ts), pas en libellé libre. */
export interface PlayerSearchCriteria {
  nameQuery?: string;
  position?: string;
  ageMin?: number;
  ageMax?: number;
  nationalities?: string[];
  preferredFoot?: Foot;
  minMarketValueEur?: number;
  maxMarketValueEur?: number;
  clubName?: string;
  limit?: number;
}

// Nombre de candidats remontés de la base avant scoring — le score doit être
// calculé sur l'ensemble des correspondances pour trier correctement, pas
// seulement sur les N premiers de l'ordre naturel de la base.
const CANDIDATE_CAP = 500;

function dateOfBirthRangeFromAge(ageMin?: number, ageMax?: number): { gte?: Date; lte?: Date } | undefined {
  if (ageMin === undefined && ageMax === undefined) return undefined;
  const now = new Date();
  const range: { gte?: Date; lte?: Date } = {};
  if (ageMax !== undefined) {
    range.gte = new Date(now.getFullYear() - ageMax - 1, now.getMonth(), now.getDate() + 1);
  }
  if (ageMin !== undefined) {
    range.lte = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate());
  }
  return range;
}

export async function searchPlayers(criteria: PlayerSearchCriteria) {
  const limit = Math.min(criteria.limit ?? 10, 50);
  const hasValueRange = criteria.minMarketValueEur !== undefined || criteria.maxMarketValueEur !== undefined;

  const players = await prisma.player.findMany({
    where: {
      OR: criteria.nameQuery
        ? [
            { firstName: { contains: criteria.nameQuery, mode: "insensitive" } },
            { lastName: { contains: criteria.nameQuery, mode: "insensitive" } },
          ]
        : undefined,
      position: criteria.position || undefined,
      dateOfBirth: dateOfBirthRangeFromAge(criteria.ageMin, criteria.ageMax),
      nationality: criteria.nationalities?.length ? { in: criteria.nationalities } : undefined,
      preferredFoot: criteria.preferredFoot || undefined,
      marketValueEur: hasValueRange
        ? { gte: criteria.minMarketValueEur, lte: criteria.maxMarketValueEur }
        : undefined,
      club: criteria.clubName ? { name: { contains: criteria.clubName, mode: "insensitive" } } : undefined,
    },
    include: { club: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: CANDIDATE_CAP,
  });

  return players
    .map((player) => ({ player, ...scorePlayer(player, criteria) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
