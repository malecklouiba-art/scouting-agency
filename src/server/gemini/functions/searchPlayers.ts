import { Type } from "@google/genai";
import { positionCodeFromLabel } from "@/lib/positions";
import { searchPlayers as searchPlayersService } from "@/server/services/search.service";
import { toPlayerSummary } from "@/server/services/player.service";
import { num, oneOf, str, strArray } from "./args";
import type { ScoutProFunction } from "./types";

export const searchPlayers: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "search_players",
    description:
      "Recherche des joueurs dans la base ScoutPro selon des critères structurés. Retourne les joueurs triés par score de pertinence. N'utilise que les critères mentionnés par l'utilisateur, laisse les autres vides.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        position: {
          type: Type.STRING,
          description: "Poste recherché (ex: 'Défenseur central', 'Ailier gauche').",
        },
        ageMin: { type: Type.INTEGER, description: "Âge minimum." },
        ageMax: { type: Type.INTEGER, description: "Âge maximum." },
        nationalities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Nationalités recherchées.",
        },
        preferredFoot: {
          type: Type.STRING,
          format: "enum",
          enum: ["LEFT", "RIGHT", "BOTH"],
          description: "Pied fort recherché.",
        },
        minMarketValueEur: { type: Type.INTEGER, description: "Valeur marchande minimum, en euros." },
        maxMarketValueEur: { type: Type.INTEGER, description: "Valeur marchande maximum, en euros." },
        clubName: { type: Type.STRING, description: "Nom du club actuel du joueur." },
        limit: { type: Type.INTEGER, description: "Nombre maximum de résultats. Défaut 10." },
      },
    },
  },
  execute: async (args) => {
    const results = await searchPlayersService({
      position: positionCodeFromLabel(str(args, "position")) ?? undefined,
      ageMin: num(args, "ageMin"),
      ageMax: num(args, "ageMax"),
      nationalities: strArray(args, "nationalities"),
      preferredFoot: oneOf(args, "preferredFoot", ["LEFT", "RIGHT", "BOTH"] as const),
      minMarketValueEur: num(args, "minMarketValueEur"),
      maxMarketValueEur: num(args, "maxMarketValueEur"),
      clubName: str(args, "clubName"),
      limit: num(args, "limit"),
    });

    return {
      count: results.length,
      players: results.map(({ player, score, breakdown }) => ({
        ...toPlayerSummary(player),
        score,
        scoreBreakdown: breakdown,
      })),
    };
  },
};
