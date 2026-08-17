"use server";

import { getCurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { SCOUTPRO_FUNCTIONS } from "@/server/gemini/functions";

export type ConfirmActionResult = { status: "ok"; message: string } | { status: "error"; message: string };

/**
 * Exécute réellement une mutation (add_to_shortlist, remove_from_shortlist,
 * create_report) après confirmation explicite de l'utilisateur dans le chat
 * — jamais appelée automatiquement par le modèle (voir gemini/router.ts).
 */
export async function confirmPendingActionAction(
  conversationId: string,
  functionName: string,
  args: Record<string, unknown>,
): Promise<ConfirmActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Non authentifié." };
  }

  const fn = SCOUTPRO_FUNCTIONS[functionName];
  if (!fn || !fn.isMutation) {
    return { status: "error", message: "Action inconnue." };
  }

  try {
    await fn.execute(args, { userId: user.id, organizationId: user.organizationId });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Une erreur est survenue.",
    };
  }

  const message = "Fait.";
  await prisma.message.create({
    data: {
      conversationId,
      role: "assistant",
      content: message,
      functionCalls: { name: functionName, confirmed: true },
    },
  });

  return { status: "ok", message };
}
