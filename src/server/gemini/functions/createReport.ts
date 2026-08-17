import { Type } from "@google/genai";
import { createReport as createReportService } from "@/server/services/report.service";
import { num, oneOf, requireStr, str } from "./args";
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
  execute: async (args, ctx) => {
    const report = await createReportService({
      playerId: requireStr(args, "playerId"),
      authorId: ctx.userId,
      organizationId: ctx.organizationId,
      context: str(args, "context"),
      rating: num(args, "rating"),
      strengths: str(args, "strengths"),
      weaknesses: str(args, "weaknesses"),
      comment: str(args, "comment"),
      recommendation: oneOf(args, "recommendation", ["TO_WATCH", "INTERESTING", "PRIORITY", "DISCARD"] as const),
    });
    return { created: true, reportId: report.id };
  },
};
