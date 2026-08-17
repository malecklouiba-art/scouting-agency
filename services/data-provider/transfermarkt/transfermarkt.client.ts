import { RateLimiter } from "./rateLimiter";

const DEFAULT_BASE_URL = "https://transfermarkt-api.fly.dev";

export class TransfermarktApiError extends Error {
  constructor(
    public readonly status: number,
    path: string,
  ) {
    super(`Transfermarkt API ${path} -> HTTP ${status}`);
  }
}

export interface RawPlayerSearchResult {
  id: string;
  name: string;
  position: string | null;
  club: { id: string; name: string } | null;
  age: number | null;
  nationalities: string[];
  marketValue: string | null;
}

export interface RawPlayerSearch {
  results: RawPlayerSearchResult[];
}

export interface RawPlayerProfile {
  id: string;
  url: string | null;
  name: string;
  fullName: string | null;
  imageUrl: string | null;
  dateOfBirth: string | null;
  height: string | null;
  citizenship: string[];
  position: { main: string | null; other: string[] };
  foot: string | null;
  shirtNumber: string | null;
  club: { id: string | null; name: string | null } | null;
  marketValue: string | null;
}

export interface RawPlayerTransfer {
  id: string | null;
  clubFrom: { id: string | null; name: string | null } | null;
  clubTo: { id: string | null; name: string | null } | null;
  date: string | null;
  season: string | null;
  fee: string | null;
}

export interface RawPlayerTransfers {
  transfers: RawPlayerTransfer[];
}

export interface RawPlayerStat {
  competitionId: string | null;
  competitionName: string | null;
  seasonId: string | null;
  clubId: string | null;
  appearances: number | null;
  goals: number | null;
  assists: number | null;
  minutesPlayed: number | null;
}

export interface RawPlayerStats {
  stats: RawPlayerStat[];
}

export interface RawClubSearchResult {
  id: string;
  name: string;
  country: string | null;
  squad: number | null;
  marketValue: string | null;
}

export interface RawClubSearch {
  results: RawClubSearchResult[];
}

export interface RawCompetitionSearchResult {
  id: string;
  name: string;
  country: string | null;
}

export interface RawCompetitionSearch {
  results: RawCompetitionSearchResult[];
}

export class TransfermarktClient {
  private readonly baseUrl: string;
  private readonly rateLimiter: RateLimiter;

  constructor(options?: { baseUrl?: string; minDelayMs?: number }) {
    this.baseUrl = options?.baseUrl ?? process.env.TRANSFERMARKT_API_URL ?? DEFAULT_BASE_URL;
    this.rateLimiter = new RateLimiter(options?.minDelayMs ?? 1000);
  }

  private get<T>(path: string): Promise<T> {
    return this.rateLimiter.schedule(async () => {
      const response = await fetch(`${this.baseUrl}${path}`);
      if (!response.ok) {
        throw new TransfermarktApiError(response.status, path);
      }
      return (await response.json()) as T;
    });
  }

  searchPlayers(query: string, page = 1): Promise<RawPlayerSearch> {
    return this.get(`/players/search/${encodeURIComponent(query)}?page_number=${page}`);
  }

  getPlayerProfile(playerId: string): Promise<RawPlayerProfile> {
    return this.get(`/players/${playerId}/profile`);
  }

  getPlayerTransfers(playerId: string): Promise<RawPlayerTransfers> {
    return this.get(`/players/${playerId}/transfers`);
  }

  getPlayerStats(playerId: string): Promise<RawPlayerStats> {
    return this.get(`/players/${playerId}/stats`);
  }

  searchClubs(query: string, page = 1): Promise<RawClubSearch> {
    return this.get(`/clubs/search/${encodeURIComponent(query)}?page_number=${page}`);
  }

  searchCompetitions(query: string, page = 1): Promise<RawCompetitionSearch> {
    return this.get(`/competitions/search/${encodeURIComponent(query)}?page_number=${page}`);
  }
}
