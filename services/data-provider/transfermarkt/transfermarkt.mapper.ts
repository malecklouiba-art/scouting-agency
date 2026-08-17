import type { Player, PlayerHistory, PlayerSearchSummary, Transfer } from "../types";
import type { RawPlayerProfile, RawPlayerSearchResult, RawPlayerStat, RawPlayerTransfer } from "./transfermarkt.client";
import {
  isLoanTransfer,
  parseDate,
  parseFoot,
  parseHeightCm,
  parseMarketValueEur,
  parseShirtNumber,
  parseTransferFee,
} from "./parsers";

// Transfermarkt ne fournit qu'un nom d'affichage complet : on coupe sur le
// dernier espace. Heuristique imparfaite pour les noms composés (ex: "Van
// Dijk" tronqué à "Dijk"), mais aucune séparation prénom/nom fiable n'est
// disponible côté source.
function splitName(displayName: string): { firstName: string; lastName: string } {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: displayName, lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1)! };
}

export function mapPlayerProfile(raw: RawPlayerProfile): Player {
  const { firstName, lastName } = splitName(raw.name);
  const [nationality, ...secondaryNationalities] = raw.citizenship;

  return {
    sourceId: raw.id,
    sourceUrl: raw.url,
    firstName,
    lastName,
    dateOfBirth: parseDate(raw.dateOfBirth),
    nationality: nationality ?? null,
    secondaryNationalities,
    heightCm: parseHeightCm(raw.height),
    preferredFoot: parseFoot(raw.foot),
    position: raw.position.main,
    secondaryPositions: raw.position.other,
    shirtNumber: parseShirtNumber(raw.shirtNumber),
    marketValueEur: parseMarketValueEur(raw.marketValue),
    photoUrl: raw.imageUrl,
    clubSourceId: raw.club?.id ?? null,
  };
}

export function mapPlayerSearchResult(raw: RawPlayerSearchResult): PlayerSearchSummary {
  return {
    sourceId: raw.id,
    name: raw.name,
    position: raw.position,
    clubSourceId: raw.club?.id ?? null,
    clubName: raw.club?.name ?? null,
    age: raw.age,
    nationalities: raw.nationalities,
    marketValueEur: parseMarketValueEur(raw.marketValue),
  };
}

export function mapPlayerTransfer(raw: RawPlayerTransfer): Transfer {
  return {
    sourceId: raw.id,
    fromClubName: raw.clubFrom?.name ?? null,
    toClubName: raw.clubTo?.name ?? null,
    date: parseDate(raw.date),
    feeEur: parseTransferFee(raw.fee),
    isLoan: isLoanTransfer(raw.fee),
  };
}

// clubName indisponible sur ce endpoint (seulement clubId) : la résolution
// vers un nom se fait au niveau de la synchro (Étape 6), contre les clubs
// déjà importés en base.
export function mapPlayerStat(raw: RawPlayerStat): PlayerHistory {
  return {
    season: raw.seasonId ?? "",
    clubSourceId: raw.clubId,
    competitionName: raw.competitionName,
    appearances: raw.appearances,
    goals: raw.goals,
    assists: raw.assists,
    minutesPlayed: raw.minutesPlayed,
  };
}
