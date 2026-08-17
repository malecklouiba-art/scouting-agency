import { Type } from "@google/genai";
import type { ScoutProFunction } from "./types";

export const getPlayer: ScoutProFunction = {
  isMutation: false,
  declaration: {
    name: "get_player",
    description: "Récupère la fiche complète d'un joueur (profil, statistiques, historique, transferts, rapports) à partir de son identifiant ScoutPro.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        playerId: { type: Type.STRING, description: "Identifiant ScoutPro du joueur (pas le nom)." },
      },
      required: ["playerId"],
    },
  },
};
