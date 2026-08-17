import { Type } from "@google/genai";
import { getPlayersByIds, toPlayerSummary } from "@/server/services/player.service";
import { requireStrArray } from "./args";
import type { ScoutProFunction } from "./types";

export const comparePlayers: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "compare_players",
    description:
      "Compare deux à quatre joueurs côte à côte (profil, statistiques, score) à partir de leurs identifiants ScoutPro.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerIds: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Identifiants ScoutPro des joueurs à comparer (2 à 4).",
        },
      },
      required: ["playerIds"],
    },
  },
  execute: async (args) => {
    const playerIds = requireStrArray(args, "playerIds").slice(0, 4);
    const players = await getPlayersByIds(playerIds);
    return { players: players.map(toPlayerSummary) };
  },
};
