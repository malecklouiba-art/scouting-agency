import { Type } from "@google/genai";
import type { ScoutProFunction } from "./types";

export const findSimilarPlayers: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "find_similar_players",
    description: "Trouve des joueurs au profil proche d'un joueur de référence (poste, statistiques).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerId: { type: Type.STRING, description: "Identifiant ScoutPro du joueur de référence." },
        limit: { type: Type.INTEGER, description: "Nombre maximum de résultats. Défaut 5." },
      },
      required: ["playerId"],
    },
  },
};
