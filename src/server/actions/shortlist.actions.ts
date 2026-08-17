"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/current-user";
import { addPlayerToShortlist, removePlayerFromShortlist } from "@/server/services/shortlist.service";

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

/**
 * Ajout/retrait rapide depuis les listes et la fiche joueur — équivalent
 * direct de add_to_shortlist/remove_from_shortlist côté chat, mais sans
 * confirmation puisque l'utilisateur clique lui-même sur le bouton.
 */
export async function toggleFollowPlayerAction(playerId: string, isFollowing: boolean) {
  const user = await getCurrentUser();
  if (!user) return;

  if (isFollowing) {
    await removePlayerFromShortlist({ organizationId: user.organizationId, ownerId: user.id, playerId });
  } else {
    await addPlayerToShortlist({
      organizationId: user.organizationId,
      ownerId: user.id,
      playerId,
      status: "TO_WATCH",
    });
  }

  revalidatePath("/shortlist");
  revalidatePath("/players");
  revalidatePath(`/players/${playerId}`);
}
