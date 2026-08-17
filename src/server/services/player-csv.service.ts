import Papa from "papaparse";
import { prisma } from "@/server/db/prisma";
import { DataSource } from "@/generated/prisma/client";
import { POSITIONS, positionCodeFromLabel } from "@/lib/positions";
import { footCodeFromInput } from "@/lib/foot";
import type { Club, Player } from "@/generated/prisma/client";

/**
 * Schéma CSV pour import/export manuel de la base joueurs — complémentaire à
 * la synchro Transfermarkt (services/data-provider), utile quand l'API
 * externe est indisponible. Les postes/pieds acceptent le code interne ou le
 * libellé français ; secondaryPositions est séparé par ";" (pas "," car
 * c'est déjà le séparateur de colonnes CSV).
 */
export const PLAYER_CSV_COLUMNS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "nationality",
  "heightCm",
  "preferredFoot",
  "position",
  "secondaryPositions",
  "shirtNumber",
  "marketValueEur",
  "clubName",
] as const;

type PlayerForExport = Player & { club: Pick<Club, "name"> | null };

export function playersToCsv(players: PlayerForExport[]): string {
  const rows = players.map((player) => ({
    firstName: player.firstName,
    lastName: player.lastName,
    dateOfBirth: player.dateOfBirth ? player.dateOfBirth.toISOString().slice(0, 10) : "",
    nationality: player.nationality ?? "",
    heightCm: player.heightCm ?? "",
    preferredFoot: player.preferredFoot ?? "",
    position: player.position ?? "",
    secondaryPositions: player.secondaryPositions.join(";"),
    shirtNumber: player.shirtNumber ?? "",
    marketValueEur: player.marketValueEur ?? "",
    clubName: player.club?.name ?? "",
  }));
  return Papa.unparse({ fields: [...PLAYER_CSV_COLUMNS], data: rows });
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportResult {
  imported: number;
  errors: ImportRowError[];
}

function resolvePosition(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (POSITIONS.some((position) => position.code === trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  return positionCodeFromLabel(trimmed);
}

async function resolveClubId(clubName: string | undefined): Promise<string | null> {
  const trimmed = clubName?.trim();
  if (!trimmed) return null;
  const existing = await prisma.club.findFirst({ where: { name: { equals: trimmed, mode: "insensitive" } } });
  if (existing) return existing.id;
  const created = await prisma.club.create({ data: { source: DataSource.MANUAL, name: trimmed } });
  return created.id;
}

/**
 * Importe des joueurs depuis un CSV (colonnes PLAYER_CSV_COLUMNS). Toujours
 * en création (source MANUAL, sans sourceId) — aucune tentative de
 * dédoublonnage contre les joueurs existants : réimporter le même fichier
 * crée de nouvelles fiches plutôt que de risquer une fusion incorrecte.
 */
export async function importPlayersFromCsv(csvText: string): Promise<ImportResult> {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });

  const errors: ImportRowError[] = parsed.errors.map((error) => ({
    row: (error.row ?? 0) + 2,
    message: error.message,
  }));

  let imported = 0;

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i]!;
    const rowNumber = i + 2; // +1 pour l'en-tête, +1 pour l'index 1-based

    const firstName = row.firstName?.trim();
    const lastName = row.lastName?.trim();
    if (!firstName || !lastName) {
      errors.push({ row: rowNumber, message: "firstName et lastName sont requis." });
      continue;
    }

    try {
      const clubId = await resolveClubId(row.clubName);
      const dateOfBirth = row.dateOfBirth?.trim() ? new Date(row.dateOfBirth.trim()) : null;

      await prisma.player.create({
        data: {
          source: DataSource.MANUAL,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth && !Number.isNaN(dateOfBirth.getTime()) ? dateOfBirth : null,
          nationality: row.nationality?.trim() || null,
          heightCm: row.heightCm?.trim() ? Number.parseInt(row.heightCm, 10) : null,
          preferredFoot: footCodeFromInput(row.preferredFoot),
          position: resolvePosition(row.position),
          secondaryPositions: row.secondaryPositions?.trim()
            ? row.secondaryPositions
                .split(";")
                .map((value) => resolvePosition(value))
                .filter((code): code is string => code !== null)
            : [],
          shirtNumber: row.shirtNumber?.trim() ? Number.parseInt(row.shirtNumber, 10) : null,
          marketValueEur: row.marketValueEur?.trim() ? Number.parseInt(row.marketValueEur, 10) : null,
          clubId,
        },
      });
      imported++;
    } catch (error) {
      errors.push({ row: rowNumber, message: error instanceof Error ? error.message : String(error) });
    }
  }

  return { imported, errors };
}
