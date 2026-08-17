import { PlayersFilters } from "@/components/players/players-filters";
import { PlayerCard } from "@/components/players/player-card";
import { EmptyState } from "@/components/shared/empty-state";
import { searchPlayers } from "@/server/services/search.service";
import { toPlayerSummary } from "@/server/services/player.service";
import type { Foot } from "@/generated/prisma/client";

interface PlayersPageProps {
  searchParams: Promise<{ q?: string; position?: string; foot?: string }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams;

  const results = await searchPlayers({
    nameQuery: params.q || undefined,
    position: params.position || undefined,
    preferredFoot: (params.foot as Foot) || undefined,
    limit: 30,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Joueurs</h1>
        <p className="text-sm text-muted-foreground">Recherchez et filtrez la base de joueurs ScoutPro.</p>
      </div>

      <PlayersFilters />

      {results.length === 0 ? (
        <EmptyState
          title="Aucun joueur pour l'instant"
          description="La base ScoutPro se remplit via une synchronisation depuis le Data Provider. Une fois les données synchronisées, vos recherches et filtres s'appliqueront ici."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {results.map(({ player, score }) => (
            <PlayerCard key={player.id} player={toPlayerSummary(player)} score={score} />
          ))}
        </div>
      )}
    </div>
  );
}
