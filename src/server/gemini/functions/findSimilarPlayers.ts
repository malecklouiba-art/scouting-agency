import { Type } from "@google/genai";
import { prisma } from "@/server/db/prisma";
import { calculateAge } from "@/lib/age";
import { getPlayerById, toPlayerSummary } from "@/server/services/player.service";
import { num, requireStr } from "./args";
import type { ScoutProFunction } from "./types";

// Pas de ML pour la MVP (hors périmètre) : similarité déterministe = même
// poste, trié par proximité d'âge avec le joueur de référence.
export const findSimilarPlayers: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "find_similar_players",
    description: "Trouve des joueurs au profil proche d'un joueur de référence (poste, âge).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerId: { type: Type.STRING, description: "Identifiant ScoutPro du joueur de référence." },
        limit: { type: Type.INTEGER, description: "Nombre maximum de résultats. Défaut 5." },
      },
      required: ["playerId"],
    },
  },
  execute: async (args) => {
    const limit = num(args, "limit") ?? 5;
    const reference = await getPlayerById(requireStr(args, "playerId"));
    if (!reference) return { found: false };

    const candidates = await prisma.player.findMany({
      where: { position: reference.position, id: { not: reference.id } },
      include: { club: true },
      take: 200,
    });

    const referenceAge = calculateAge(reference.dateOfBirth);
    const ranked = candidates
      .map((player) => {
        const age = calculateAge(player.dateOfBirth);
        const ageDistance = referenceAge !== null && age !== null ? Math.abs(age - referenceAge) : 99;
        return { player, ageDistance };
      })
      .sort((a, b) => a.ageDistance - b.ageDistance)
      .slice(0, limit);

    return {
      found: true,
      referencePlayer: toPlayerSummary(reference),
      players: ranked.map(({ player }) => toPlayerSummary(player)),
    };
  },
};
