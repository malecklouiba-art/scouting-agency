"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/current-user";
import { importPlayersFromCsv, type ImportResult } from "@/server/services/player-csv.service";
import { DEMO_PLAYERS_CSV } from "@/server/data/demo-players";

export type ImportActionState = { status: "error"; message: string } | ({ status: "success" } & ImportResult) | null;

export async function importPlayersCsvAction(
  _prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Non authentifié." };
  }
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return { status: "error", message: "Réservé aux administrateurs." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Aucun fichier CSV sélectionné." };
  }

  const csvText = await file.text();
  const result = await importPlayersFromCsv(csvText);

  revalidatePath("/players");

  return { status: "success", ...result };
}

/**
 * Charge le jeu de données fictif (30 joueurs) via la même logique
 * d'import que le CSV manuel — pour se faire une idée du logiciel sans
 * attendre un sync réel ou préparer soi-même un fichier.
 */
export async function seedDemoPlayersAction(): Promise<ImportActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Non authentifié." };
  }
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return { status: "error", message: "Réservé aux administrateurs." };
  }

  const result = await importPlayersFromCsv(DEMO_PLAYERS_CSV);

  revalidatePath("/players");

  return { status: "success", ...result };
}
