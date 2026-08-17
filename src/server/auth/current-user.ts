import { cache } from "react";
import { createClient } from "@/server/supabase/server";
import { prisma } from "@/server/db/prisma";
import type { User } from "@/generated/prisma/client";

/**
 * Avant ce correctif, signUpAction ne donnait jamais le rôle OWNER au
 * créateur d'une organisation (défaut Prisma SCOUT) — toute organisation
 * créée avant le fix n'a donc aucun membre OWNER/ADMIN, ce qui bloque
 * définitivement les fonctionnalités admin (import CSV, sync) sans recours.
 * Auto-répare à la prochaine requête de l'un de ses membres en le
 * promouvant OWNER ; sans effet dès qu'un membre a déjà ce rôle, donc pas
 * de chemin d'escalade de privilège dans une organisation saine.
 */
async function healOrphanedOrganization(user: User): Promise<User> {
  const hasAdmin = await prisma.user.findFirst({
    where: { organizationId: user.organizationId, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (hasAdmin) return user;

  return prisma.user.update({ where: { id: user.id }, data: { role: "OWNER" } });
}

/**
 * Utilisateur ScoutPro courant (table Prisma User, pas seulement la session
 * Supabase) — mis en cache pour la durée de la requête, pour que layout et
 * page puissent tous deux l'appeler sans dupliquer la requête base de
 * données.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const user = await prisma.user.findUnique({
    where: { supabaseUserId: data.claims.sub },
  });
  if (!user) return null;

  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return healOrphanedOrganization(user);
  }

  return user;
});
