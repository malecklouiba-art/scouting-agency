import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase pour Server Components / Server Actions / Route Handlers.
 * À recréer à chaque requête — ne jamais le mettre en singleton global
 * (contrairement au client Prisma), car il porte les cookies de LA requête
 * en cours.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : impossible d'écrire des
            // cookies ici. Sans effet tant que le middleware rafraîchit
            // la session sur chaque requête (voir src/middleware.ts).
          }
        },
      },
    },
  );
}
