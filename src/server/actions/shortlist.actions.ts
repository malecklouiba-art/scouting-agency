"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/current-user";
import { removePlayerFromShortlist } from "@/server/services/shortlist.service";

export async function removeFromShortlistAction(playerId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await removePlayerFromShortlist({
    organizationId: user.organizationId,
    ownerId: user.id,
    playerId,
  });

  revalidatePath("/shortlist");
}
