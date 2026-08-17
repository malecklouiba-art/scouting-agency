import { prisma } from "@/server/db/prisma";
import type { ReportRecommendation } from "@/generated/prisma/client";

export function createReport(params: {
  playerId: string;
  authorId: string;
  organizationId: string;
  context?: string;
  rating?: number;
  strengths?: string;
  weaknesses?: string;
  comment?: string;
  recommendation?: ReportRecommendation;
}) {
  return prisma.report.create({
    data: {
      playerId: params.playerId,
      authorId: params.authorId,
      organizationId: params.organizationId,
      context: params.context,
      rating: params.rating,
      strengths: params.strengths,
      weaknesses: params.weaknesses,
      comment: params.comment,
      recommendation: params.recommendation,
    },
  });
}
