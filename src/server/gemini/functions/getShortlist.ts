import { Type } from "@google/genai";
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
};
