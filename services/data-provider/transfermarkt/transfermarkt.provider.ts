import type { ClubDataProvider, CompetitionDataProvider, PlayerDataProvider } from "../provider.interface";
import type {
  ClubSearchSummary,
  CompetitionSearchSummary,
  Player,
  PlayerHistory,
  PlayerSearchSummary,
  Transfer,
  TransfermarktSearchQuery,
} from "../types";
import { TransfermarktApiError, TransfermarktClient } from "./transfermarkt.client";
import {
  mapClubSearchResult,
  mapCompetitionSearchResult,
  mapPlayerProfile,
  mapPlayerSearchResult,
  mapPlayerStat,
  mapPlayerTransfer,
} from "./transfermarkt.mapper";

export class TransfermarktProvider implements PlayerDataProvider, ClubDataProvider, CompetitionDataProvider {
  constructor(private readonly client: TransfermarktClient = new TransfermarktClient()) {}

  async searchPlayers(criteria: TransfermarktSearchQuery): Promise<PlayerSearchSummary[]> {
    const raw = await this.client.searchPlayers(criteria.query, criteria.page);
    return raw.results.map(mapPlayerSearchResult);
  }

  async getPlayer(sourceId: string): Promise<Player | null> {
    try {
      const raw = await this.client.getPlayerProfile(sourceId);
      return mapPlayerProfile(raw);
    } catch (error) {
      if (error instanceof TransfermarktApiError && error.status === 404) return null;
      throw error;
    }
  }

  async getPlayerTransfers(sourceId: string): Promise<Transfer[]> {
    const raw = await this.client.getPlayerTransfers(sourceId);
    return raw.transfers.map(mapPlayerTransfer);
  }

  async getPlayerHistory(sourceId: string): Promise<PlayerHistory[]> {
    const raw = await this.client.getPlayerStats(sourceId);
    return raw.stats.map(mapPlayerStat);
  }

  async searchClubs(criteria: TransfermarktSearchQuery): Promise<ClubSearchSummary[]> {
    const raw = await this.client.searchClubs(criteria.query, criteria.page);
    return raw.results.map(mapClubSearchResult);
  }

  async searchCompetitions(criteria: TransfermarktSearchQuery): Promise<CompetitionSearchSummary[]> {
    const raw = await this.client.searchCompetitions(criteria.query, criteria.page);
    return raw.results.map(mapCompetitionSearchResult);
  }
}
