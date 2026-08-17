import { Type } from "@google/genai";
import { getShortlistPlayers } from "@/server/services/shortlist.service";
import { toPlayerSummary } from "@/server/services/player.service";
import { num } from "./args";
import type { ScoutProFunction } from "./types";

export const getRecentPlayers: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "get_recent_players",
    description: "Récupère les joueurs récemment ajoutés à la shortlist de l'utilisateur.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.INTEGER, description: "Nombre maximum de résultats. Défaut 10." },
      },
    },
  },
  execute: async (args, ctx) => {
    const limit = num(args, "limit") ?? 10;
    const entries = await getShortlistPlayers({ organizationId: ctx.organizationId, ownerId: ctx.userId });
    return {
      players: entries.slice(0, limit).map((entry) => ({
        ...toPlayerSummary(entry.player),
        addedAt: entry.addedAt.toISOString(),
      })),
    };
  },
};
