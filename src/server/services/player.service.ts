import { prisma } from "@/server/db/prisma";
import { calculateAge } from "@/lib/age";
import { positionLabel } from "@/lib/positions";
import type { Club, Player } from "@/generated/prisma/client";

export interface PlayerSummary {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  positionLabel: string | null;
  clubName: string | null;
  age: number | null;
  nationality: string | null;
  marketValueEur: number | null;
  photoUrl: string | null;
}

type PlayerWithClub = Player & { club?: Pick<Club, "name"> | null };

export function toPlayerSummary(player: PlayerWithClub): PlayerSummary {
  return {
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    position: player.position,
    positionLabel: positionLabel(player.position),
    clubName: player.club?.name ?? null,
    age: calculateAge(player.dateOfBirth),
    nationality: player.nationality,
    marketValueEur: player.marketValueEur,
    photoUrl: player.photoUrl,
  };
}

export function getPlayerById(playerId: string) {
  return prisma.player.findUnique({ where: { id: playerId }, include: { club: true } });
}

export function getPlayersByIds(playerIds: string[]) {
  return prisma.player.findMany({ where: { id: { in: playerIds } }, include: { club: true } });
}
