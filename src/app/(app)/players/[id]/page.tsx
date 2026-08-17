import { prisma } from "@/server/db/prisma";
import { calculateAge } from "@/lib/age";
import { positionLabel } from "@/lib/positions";
import { FOOT_LABELS } from "@/lib/foot";
import { RECOMMENDATION_BADGE_VARIANT, RECOMMENDATION_LABELS } from "@/lib/recommendation";
import { EmptyState } from "@/components/shared/empty-state";
import { PlayerTabs } from "@/components/players/player-tabs";
import { CreateReportForm } from "@/components/players/create-report-form";
import { PlayerFutCard } from "@/components/players/player-fut-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/server/auth/current-user";
import { getFollowedPlayerIds } from "@/server/services/shortlist.service";

function formatEur(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    value,
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [player, user] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: {
        club: true,
        transfers: { orderBy: { date: "desc" } },
        history: { orderBy: { season: "desc" } },
        stats: true,
        reports: { include: { author: true }, orderBy: { date: "desc" } },
      },
    }),
    getCurrentUser(),
  ]);

  const isFollowing =
    player && user
      ? (await getFollowedPlayerIds({ organizationId: user.organizationId, ownerId: user.id })).has(player.id)
      : false;

  if (!player) {
    return (
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <EmptyState
          title="Joueur introuvable"
          description="Ce joueur n'existe pas ou n'a pas encore été synchronisé dans la base ScoutPro."
        />
      </div>
    );
  }

  const age = calculateAge(player.dateOfBirth);

  const tabs = [
    {
      id: "profil",
      label: "Profil",
      content: (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoItem label="Poste" value={positionLabel(player.position) ?? "—"} />
          <InfoItem label="Âge" value={age ? `${age} ans` : "—"} />
          <InfoItem label="Nationalité" value={player.nationality ?? "—"} />
          <InfoItem label="Pied fort" value={player.preferredFoot ? FOOT_LABELS[player.preferredFoot] : "—"} />
          <InfoItem label="Taille" value={player.heightCm ? `${player.heightCm} cm` : "—"} />
          <InfoItem label="Valeur marchande" value={formatEur(player.marketValueEur)} />
          <InfoItem label="Club actuel" value={player.club?.name ?? "—"} />
          <InfoItem label="Numéro" value={player.shirtNumber ? `#${player.shirtNumber}` : "—"} />
        </div>
      ),
    },
    {
      id: "statistiques",
      label: "Statistiques",
      content:
        player.stats.length === 0 ? (
          <EmptyState title="Aucune statistique" description="Pas encore de statistiques avancées pour ce joueur." />
        ) : (
          <div className="flex flex-col gap-2">
            {player.stats.map((stat) => (
              <div key={stat.id} className="flex justify-between border-b border-border py-2 text-sm">
                <span className="text-muted-foreground">
                  {stat.key}
                  {stat.season ? ` (${stat.season})` : ""}
                </span>
                <span className="text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        ),
    },
    {
      id: "historique",
      label: "Historique",
      content:
        player.history.length === 0 ? (
          <EmptyState title="Aucun historique" description="Pas encore d'historique de saisons pour ce joueur." />
        ) : (
          <div className="flex flex-col gap-2">
            {player.history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm"
              >
                <span className="text-foreground">
                  {entry.season} — {entry.clubName ?? "Club inconnu"}
                  {entry.competitionName ? ` (${entry.competitionName})` : ""}
                </span>
                <span className="text-muted-foreground">
                  {entry.appearances ?? 0} matchs · {entry.goals ?? 0} buts · {entry.assists ?? 0} passes déc.
                </span>
              </div>
            ))}
          </div>
        ),
    },
    {
      id: "transferts",
      label: "Transferts",
      content:
        player.transfers.length === 0 ? (
          <EmptyState title="Aucun transfert" description="Pas encore d'historique de transferts pour ce joueur." />
        ) : (
          <div className="flex flex-col gap-2">
            {player.transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm"
              >
                <span className="text-foreground">
                  {transfer.fromClubName ?? "?"} → {transfer.toClubName ?? "?"}
                </span>
                <span className="text-muted-foreground">
                  {formatDate(transfer.date)} · {transfer.isLoan ? "Prêt" : formatEur(transfer.feeEur)}
                </span>
              </div>
            ))}
          </div>
        ),
    },
    {
      id: "rapports",
      label: "Rapports",
      content: (
        <div className="flex flex-col gap-4">
          <CreateReportForm playerId={player.id} />

          {player.reports.length === 0 ? (
            <EmptyState
              title="Aucun rapport"
              description="Aucun rapport de scouting n'a encore été créé pour ce joueur."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {player.reports.map((report) => (
                <Card key={report.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {report.author.firstName ?? report.author.email}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(report.date)}</span>
                  </div>
                  {report.comment && <p className="text-sm text-muted-foreground">{report.comment}</p>}
                  {report.recommendation && (
                    <Badge variant={RECOMMENDATION_BADGE_VARIANT[report.recommendation]}>
                      {RECOMMENDATION_LABELS[report.recommendation]}
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-6 md:flex-row">
      <div className="flex md:basis-[40%]">
        <PlayerFutCard player={player} club={player.club} age={age} isFollowing={isFollowing} />
      </div>

      <div className="flex min-w-0 flex-col md:basis-[60%]">
        <PlayerTabs tabs={tabs} />
      </div>
    </div>
  );
}
