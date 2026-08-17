import { Type } from "@google/genai";
import type { ScoutProFunction } from "./types";

export const addToShortlist: ScoutProFunction = {
  isMutation: true,
  declaration: {
    name: "add_to_shortlist",
    description: "Ajoute un joueur à la shortlist de l'utilisateur. Nécessite une confirmation explicite avant exécution.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerId: { type: Type.STRING, description: "Identifiant ScoutPro du joueur à ajouter." },
        status: {
          type: Type.STRING,
          format: "enum",
          enum: ["TO_WATCH", "INTERESTING", "PRIORITY", "DISCARDED"],
          description: "Statut initial. Défaut TO_WATCH (à suivre).",
        },
        note: { type: Type.STRING, description: "Note optionnelle sur ce joueur." },
      },
      required: ["playerId"],
    },
  },
};
