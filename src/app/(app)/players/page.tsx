import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";
import { PlayersFilters } from "@/components/players/players-filters";
import { PlayerCard } from "@/components/players/player-card";
import { PlayersTable } from "@/components/players/players-table";
import { ImportExportButtons } from "@/components/players/import-export-buttons";
import { SeedDemoDataButton } from "@/components/players/seed-demo-data-button";
import { EmptyState } from "@/components/shared/empty-state";
import { searchPlayers } from "@/server/services/search.service";
import { toPlayerSummary } from "@/server/services/player.service";
import { getFollowedPlayerIds } from "@/server/services/shortlist.service";
import { getCurrentUser } from "@/server/auth/current-user";
import { cn } from "@/lib/utils";
import type { Foot } from "@/generated/prisma/client";

interface PlayersPageProps {
  searchParams: Promise<{ q?: string; position?: string; foot?: string; view?: string }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const isAdmin = user?.role === "OWNER" || user?.role === "ADMIN";
  const view = params.view === "cards" ? "cards" : "table";

  const [results, followedIds] = await Promise.all([
    searchPlayers({
      nameQuery: params.q || undefined,
      position: params.position || undefined,
      preferredFoot: (params.foot as Foot) || undefined,
      limit: 30,
    }),
    user
      ? getFollowedPlayerIds({ organizationId: user.organizationId, ownerId: user.id })
      : Promise.resolve(new Set<string>()),
  ]);

  const otherParams = new URLSearchParams();
  if (params.q) otherParams.set("q", params.q);
  if (params.position) otherParams.set("position", params.position);
  if (params.foot) otherParams.set("foot", params.foot);
  const queryPrefix = otherParams.toString() ? `${otherParams.toString()}&` : "";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Joueurs</h1>
          <p className="text-sm text-muted-foreground">Recherchez et filtrez la base de joueurs ScoutPro.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <Link
              href={`/players?${queryPrefix}view=table`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm",
                view === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Table2 className="size-4" />
              Tableau
            </Link>
            <Link
              href={`/players?${queryPrefix}view=cards`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm",
                view === "cards" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
              Cartes
            </Link>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-start gap-2">
              <SeedDemoDataButton />
              <ImportExportButtons />
            </div>
          )}
        </div>
      </div>

      <PlayersFilters />

      {results.length === 0 ? (
        params.q || params.position || params.foot ? (
          <EmptyState
            title="Aucun résultat"
            description="Aucun joueur ne correspond à ces critères. Essayez d'élargir la recherche ou de retirer un filtre."
          />
        ) : (
          <EmptyState
            title="Aucun joueur pour l'instant"
            description="La base ScoutPro se remplit via une synchronisation depuis le Data Provider, ou en important un CSV. Une fois des joueurs présents, vos recherches et filtres s'appliqueront ici."
          />
        )
      ) : view === "table" ? (
        <PlayersTable
          rows={results.map(({ player, score }) => ({
            player: toPlayerSummary(player),
            score,
            isFollowing: followedIds.has(player.id),
          }))}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {results.map(({ player, score }) => (
            <PlayerCard
              key={player.id}
              player={toPlayerSummary(player)}
              score={score}
              isFollowing={followedIds.has(player.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
