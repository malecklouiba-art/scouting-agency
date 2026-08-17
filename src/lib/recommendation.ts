import type { ReportRecommendation } from "@/generated/prisma/client";

export const RECOMMENDATION_LABELS: Record<ReportRecommendation, string> = {
  TO_WATCH: "À suivre",
  INTERESTING: "Intéressant",
  PRIORITY: "Prioritaire",
  DISCARD: "Écarté",
};

/** Hiérarchie visuelle : une recommandation Prioritaire doit se voir au premier coup d'œil, un Écarté doit s'effacer. */
export const RECOMMENDATION_BADGE_VARIANT: Record<ReportRecommendation, "default" | "secondary" | "outline" | "destructive"> = {
  TO_WATCH: "outline",
  INTERESTING: "secondary",
  PRIORITY: "default",
  DISCARD: "destructive",
};
