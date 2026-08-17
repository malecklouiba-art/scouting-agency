import { Type } from "@google/genai";
import type { ScoutProFunction } from "./types";

export const removeFromShortlist: ScoutProFunction = {
  isMutation: true,
  declaration: {
    name: "remove_from_shortlist",
    description: "Retire un joueur de la shortlist de l'utilisateur. Nécessite une confirmation explicite avant exécution.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerId: { type: Type.STRING, description: "Identifiant ScoutPro du joueur à retirer." },
      },
      required: ["playerId"],
    },
  },
};
