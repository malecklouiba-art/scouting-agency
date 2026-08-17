"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/current-user";
import { createReport } from "@/server/services/report.service";
import type { ReportRecommendation } from "@/generated/prisma/client";

export type ReportActionState = {
  status: "error" | "success";
  message: string;
} | null;

export async function createReportAction(
  playerId: string,
  _prevState: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Non authentifié." };
  }

  const recommendation = String(formData.get("recommendation") ?? "");
  const rating = formData.get("rating");

  await createReport({
    playerId,
    authorId: user.id,
    organizationId: user.organizationId,
    context: String(formData.get("context") ?? "").trim() || undefined,
    rating: rating ? Number(rating) : undefined,
    strengths: String(formData.get("strengths") ?? "").trim() || undefined,
    weaknesses: String(formData.get("weaknesses") ?? "").trim() || undefined,
    comment: String(formData.get("comment") ?? "").trim() || undefined,
    recommendation: (["TO_WATCH", "INTERESTING", "PRIORITY", "DISCARD"] as const).includes(
      recommendation as ReportRecommendation,
    )
      ? (recommendation as ReportRecommendation)
      : undefined,
  });

  revalidatePath(`/players/${playerId}`);
  revalidatePath("/reports");

  return { status: "success", message: "Rapport créé." };
}
