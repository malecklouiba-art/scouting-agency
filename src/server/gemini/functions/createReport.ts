import { Type } from "@google/genai";
import type { ScoutProFunction } from "./types";

export const createReport: ScoutProFunction = {
  isMutation: true,
  declaration: {
    name: "create_report",
    description: "Crée un rapport de scouting sur un joueur. Nécessite une confirmation explicite avant exécution.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerId: { type: Type.STRING, description: "Identifiant ScoutPro du joueur observé." },
        context: { type: Type.STRING, description: "Contexte de l'observation (ex: match, compétition, date)." },
        rating: { type: Type.INTEGER, description: "Note globale, sur 10." },
        strengths: { type: Type.STRING, description: "Points forts observés." },
        weaknesses: { type: Type.STRING, description: "Points faibles observés." },
        comment: { type: Type.STRING, description: "Commentaire libre." },
        recommendation: {
          type: Type.STRING,
          format: "enum",
          enum: ["TO_WATCH", "INTERESTING", "PRIORITY", "DISCARD"],
          description: "Recommandation finale.",
        },
      },
      required: ["playerId"],
    },
  },
};
