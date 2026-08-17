import { prisma } from "@/server/db/prisma";
import { calculateAge } from "@/lib/age";
import { positionLabel } from "@/lib/positions";
import { FOOT_LABELS } from "@/lib/foot";
import { RECOMMENDATION_LABELS } from "@/lib/recommendation";
import { EmptyState } from "@/components/shared/empty-state";
import { PlayerTabs } from "@/components/players/player-tabs";
import { CreateReportForm } from "@/components/players/create-report-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      club: true,
      transfers: { orderBy: { date: "desc" } },
      history: { orderBy: { season: "desc" } },
      stats: true,
      reports: { include: { author: true }, orderBy: { date: "desc" } },
    },
  });

  if (!player) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
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
                    <Badge variant="secondary">{RECOMMENDATION_LABELS[report.recommendation]}</Badge>
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={player.photoUrl ?? undefined} alt={`${player.firstName} ${player.lastName}`} />
          <AvatarFallback className="text-lg">
            {player.firstName[0]}
            {player.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {player.firstName} {player.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[positionLabel(player.position), player.club?.name, age ? `${age} ans` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <PlayerTabs tabs={tabs} />
    </div>
  );
}
