import type {
  ClubSearchSummary,
  CompetitionSearchSummary,
  Player,
  PlayerHistory,
  PlayerSearchSummary,
  Transfer,
  TransfermarktSearchQuery,
} from "./types";

export interface PlayerDataProvider {
  searchPlayers(criteria: TransfermarktSearchQuery): Promise<PlayerSearchSummary[]>;
  getPlayer(sourceId: string): Promise<Player | null>;
  getPlayerTransfers(sourceId: string): Promise<Transfer[]>;
  getPlayerHistory(sourceId: string): Promise<PlayerHistory[]>;
}

export interface ClubDataProvider {
  searchClubs(criteria: TransfermarktSearchQuery): Promise<ClubSearchSummary[]>;
}

export interface CompetitionDataProvider {
  searchCompetitions(criteria: TransfermarktSearchQuery): Promise<CompetitionSearchSummary[]>;
}
