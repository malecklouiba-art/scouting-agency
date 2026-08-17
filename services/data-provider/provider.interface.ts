import type { Player, PlayerHistory, PlayerSearchSummary, Transfer, TransfermarktPlayerQuery } from "./types";

export interface PlayerDataProvider {
  searchPlayers(criteria: TransfermarktPlayerQuery): Promise<PlayerSearchSummary[]>;
  getPlayer(sourceId: string): Promise<Player | null>;
  getPlayerTransfers(sourceId: string): Promise<Transfer[]>;
  getPlayerHistory(sourceId: string): Promise<PlayerHistory[]>;
}
