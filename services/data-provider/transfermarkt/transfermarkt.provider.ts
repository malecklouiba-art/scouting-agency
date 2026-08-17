import type { PlayerDataProvider } from "../provider.interface";
import type { Player, PlayerHistory, PlayerSearchSummary, Transfer, TransfermarktPlayerQuery } from "../types";
import { TransfermarktApiError, TransfermarktClient } from "./transfermarkt.client";
import { mapPlayerProfile, mapPlayerSearchResult, mapPlayerStat, mapPlayerTransfer } from "./transfermarkt.mapper";

export class TransfermarktProvider implements PlayerDataProvider {
  constructor(private readonly client: TransfermarktClient = new TransfermarktClient()) {}

  async searchPlayers(criteria: TransfermarktPlayerQuery): Promise<PlayerSearchSummary[]> {
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
}
