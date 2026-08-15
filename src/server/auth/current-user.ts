import { cache } from "react";
import { createClient } from "@/server/supabase/server";
import { prisma } from "@/server/db/prisma";

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

  return prisma.user.findUnique({
    where: { supabaseUserId: data.claims.sub },
  });
});
