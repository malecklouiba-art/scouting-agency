import { addToShortlist } from "./addToShortlist";
import { comparePlayers } from "./comparePlayers";
import { createReport } from "./createReport";
import { findSimilarPlayers } from "./findSimilarPlayers";
import { getPlayer } from "./getPlayer";
import { getRecentPlayers } from "./getRecentPlayers";
import { getShortlist } from "./getShortlist";
import { removeFromShortlist } from "./removeFromShortlist";
import { searchPlayers } from "./searchPlayers";
import type { ScoutProFunction } from "./types";

export const SCOUTPRO_FUNCTIONS: Record<string, ScoutProFunction> = {
  search_players: searchPlayers,
  get_player: getPlayer,
  compare_players: comparePlayers,
  add_to_shortlist: addToShortlist,
  remove_from_shortlist: removeFromShortlist,
  get_shortlist: getShortlist,
  create_report: createReport,
  get_recent_players: getRecentPlayers,
  find_similar_players: findSimilarPlayers,
};

export const FUNCTION_DECLARATIONS = Object.values(SCOUTPRO_FUNCTIONS).map((fn) => fn.declaration);

export type { ScoutProFunction } from "./types";
