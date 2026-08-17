import { Type } from "@google/genai";
import { getShortlistPlayers } from "@/server/services/shortlist.service";
import { toPlayerSummary } from "@/server/services/player.service";
import { oneOf } from "./args";
import type { ScoutProFunction } from "./types";

export const getShortlist: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "get_shortlist",
    description: "Récupère la shortlist de l'utilisateur : joueurs, statut, date d'ajout, dernière note.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          format: "enum",
          enum: ["TO_WATCH", "INTERESTING", "PRIORITY", "DISCARDED"],
          description: "Filtre optionnel par statut.",
        },
      },
    },
  },
  execute: async (args, ctx) => {
    const entries = await getShortlistPlayers({
      organizationId: ctx.organizationId,
      ownerId: ctx.userId,
      status: oneOf(args, "status", ["TO_WATCH", "INTERESTING", "PRIORITY", "DISCARDED"] as const),
    });

    return {
      count: entries.length,
      players: entries.map((entry) => ({
        ...toPlayerSummary(entry.player),
        status: entry.status,
        note: entry.lastNote,
        addedAt: entry.addedAt.toISOString(),
      })),
    };
  },
};
