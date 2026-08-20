import Link from "next/link";
import { Clock, ClipboardList, Search, Users, Wallet } from "lucide-react";
import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { getShortlistPlayers } from "@/server/services/shortlist.service";
import { toPlayerSummary } from "@/server/services/player.service";
import { calculateAge } from "@/lib/age";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActivityPill } from "@/components/dashboard/activity-pill";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBreakdownCard } from "@/components/dashboard/status-breakdown-card";
import { CoverageRatioCard } from "@/components/dashboard/coverage-ratio-card";
import { ShortlistHighlightCard } from "@/components/dashboard/shortlist-highlight-card";
import { RecentReportCard } from "@/components/dashboard/recent-report-card";
import { PlayerSpotlightPanel } from "@/components/dashboard/player-spotlight-panel";
import { EmptyState } from "@/components/shared/empty-state";
import type { ShortlistStatus } from "@/generated/prisma/client";

const EMPTY_STATUS_COUNTS: Record<ShortlistStatus, number> = {
  PRIORITY: 0,
  INTERESTING: 0,
  TO_WATCH: 0,
  DISCARDED: 0,
};

function relativeTime(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} j`;
}

function formatCompactEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [shortlistEntries, reportsCount, recentReports] = await Promise.all([
    getShortlistPlayers({ organizationId: user.organizationId, ownerId: user.id }),
    prisma.report.count({ where: { organizationId: user.organizationId } }),
    prisma.report.findMany({
      where: { organizationId: user.organizationId },
      include: { player: true, author: true },
      orderBy: { date: "desc" },
      take: 3,
    }),
  ]);

  const spotlightEntry = shortlistEntries[0] ?? null;
  const [spotlightReports, playersWithReports] = await Promise.all([
    spotlightEntry
      ? prisma.report.findMany({ where: { playerId: spotlightEntry.playerId }, orderBy: { date: "desc" } })
      : Promise.resolve([]),
    shortlistEntries.length > 0
      ? prisma.report.findMany({
          where: { playerId: { in: shortlistEntries.map((entry) => entry.playerId) } },
          select: { playerId: true },
          distinct: ["playerId"],
        })
      : Promise.resolve([]),
  ]);
  const latestSpotlightReport = spotlightReports[0] ?? null;

  const statusCounts = shortlistEntries.reduce(
    (counts, entry) => ({ ...counts, [entry.status]: counts[entry.status] + 1 }),
    EMPTY_STATUS_COUNTS,
  );
  const totalMarketValue = shortlistEntries.reduce((sum, entry) => sum + (entry.player.marketValueEur ?? 0), 0);

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
  const todayLabel = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date());

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bonjour{user.firstName ? ` ${user.firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
        </div>
        <Link href="/players" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
          <Search className="size-4" />
          Rechercher un joueur
        </Link>
      </div>

      <div className="glass flex flex-col gap-2 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Activité récente
        </div>
        {shortlistEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité pour l&apos;instant.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {shortlistEntries.slice(0, 5).map((entry) => (
              <ActivityPill
                key={entry.id}
                playerId={entry.player.id}
                firstName={entry.player.firstName}
                lastName={entry.player.lastName}
                photoUrl={entry.player.photoUrl}
                meta={relativeTime(entry.addedAt)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Joueurs suivis" value={shortlistEntries.length} icon={Users} />
        <StatCard label="Rapports rédigés" value={reportsCount} icon={ClipboardList} />
        <StatCard label="Valeur totale suivie" value={formatCompactEur(totalMarketValue)} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <StatusBreakdownCard counts={statusCounts} />
        <CoverageRatioCard withReport={playersWithReports.length} total={shortlistEntries.length} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-6 lg:basis-[65%]">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Ajouts récents à la shortlist</h2>
              <Link href="/shortlist" className="text-xs text-muted-foreground hover:text-foreground">
                Tout voir
              </Link>
            </div>
            {shortlistEntries.length === 0 ? (
              <EmptyState
                title="Votre shortlist est vide"
                description="Suivez un joueur depuis sa fiche pour le voir apparaître ici."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {shortlistEntries.slice(0, 4).map((entry) => (
                  <ShortlistHighlightCard key={entry.id} player={toPlayerSummary(entry.player)} status={entry.status} />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Derniers rapports</h2>
              <Link href="/reports" className="text-xs text-muted-foreground hover:text-foreground">
                Tout voir
              </Link>
            </div>
            {recentReports.length === 0 ? (
              <EmptyState
                title="Aucun rapport pour l'instant"
                description="Créez un rapport depuis une fiche joueur pour le retrouver ici."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recentReports.map((report, index) => (
                  <RecentReportCard
                    key={report.id}
                    reportId={report.id}
                    playerName={`${report.player.firstName} ${report.player.lastName}`}
                    authorName={report.author.firstName ?? report.author.email}
                    date={dateFormatter.format(report.date)}
                    recommendation={report.recommendation}
                    featured={index === 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col lg:basis-[35%]">
          {spotlightEntry ? (
            <PlayerSpotlightPanel
              player={spotlightEntry.player}
              club={spotlightEntry.player.club}
              age={calculateAge(spotlightEntry.player.dateOfBirth)}
              reportCount={spotlightReports.length}
              latestReport={
                latestSpotlightReport
                  ? {
                      date: dateFormatter.format(latestSpotlightReport.date),
                      recommendation: latestSpotlightReport.recommendation,
                      excerpt: latestSpotlightReport.strengths ?? latestSpotlightReport.comment,
                    }
                  : null
              }
            />
          ) : (
            <EmptyState
              title="Aucun joueur en vedette"
              description="Suivez un joueur pour voir sa fiche et sa synthèse ici."
            />
          )}
        </div>
      </div>
    </div>
  );
}
