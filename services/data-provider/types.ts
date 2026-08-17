export type Foot = "LEFT" | "RIGHT" | "BOTH";

/**
 * Recherche texte simple contre la source externe — distincte des critères
 * riches de recherche (position, âge, attributs...) utilisés par
 * search.service.ts et Gemini (Étape 10-11), qui interrogent Postgres.
 */
export interface TransfermarktPlayerQuery {
  query: string;
  page?: number;
}

export interface PlayerSearchSummary {
  sourceId: string;
  name: string;
  position: string | null;
  clubSourceId: string | null;
  clubName: string | null;
  age: number | null;
  nationalities: string[];
  marketValueEur: number | null;
}

export interface Player {
  sourceId: string;
  sourceUrl: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  nationality: string | null;
  secondaryNationalities: string[];
  heightCm: number | null;
  preferredFoot: Foot | null;
  position: string | null;
  secondaryPositions: string[];
  shirtNumber: number | null;
  marketValueEur: number | null;
  photoUrl: string | null;
  clubSourceId: string | null;
}

export interface Transfer {
  sourceId: string | null;
  fromClubName: string | null;
  toClubName: string | null;
  date: Date | null;
  feeEur: number | null;
  isLoan: boolean;
}

export interface PlayerHistory {
  season: string;
  clubSourceId: string | null;
  competitionName: string | null;
  appearances: number | null;
  goals: number | null;
  assists: number | null;
  minutesPlayed: number | null;
}
