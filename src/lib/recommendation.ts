import type { ReportRecommendation } from "@/generated/prisma/client";

export const RECOMMENDATION_LABELS: Record<ReportRecommendation, string> = {
  TO_WATCH: "À suivre",
  INTERESTING: "Intéressant",
  PRIORITY: "Prioritaire",
  DISCARD: "Écarté",
};
