import "dotenv/config";
import { syncClubs } from "./syncClubs";
import { syncCompetitions } from "./syncCompetitions";
import { syncPlayers } from "./syncPlayers";

const SYNC_BY_ENTITY = {
  players: syncPlayers,
  clubs: syncClubs,
  competitions: syncCompetitions,
} as const;

type Entity = keyof typeof SYNC_BY_ENTITY;

function isEntity(value: string | undefined): value is Entity {
  return value !== undefined && value in SYNC_BY_ENTITY;
}

async function main() {
  const [entity, ...queryParts] = process.argv.slice(2);
  const query = queryParts.join(" ").trim();

  if (!isEntity(entity) || !query) {
    console.error(`Usage: pnpm sync:<${Object.keys(SYNC_BY_ENTITY).join("|")}> -- "<recherche>"`);
    process.exit(1);
  }

  const result = await SYNC_BY_ENTITY[entity](query, "cli");
  console.log(result);
  process.exit(result.errors > 0 && result.created + result.updated === 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
