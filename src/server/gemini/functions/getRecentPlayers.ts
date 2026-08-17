import { Type } from "@google/genai";
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
};
