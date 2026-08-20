import Link from "next/link";
import { FileText, Target } from "lucide-react";
import { PlayerFutCard } from "@/components/players/player-fut-card";
import { Card } from "@/components/ui/card";
import { RECOMMENDATION_LABELS } from "@/lib/recommendation";
import type { Club, Player, ReportRecommendation } from "@/generated/prisma/client";

type SpotlightPlayer = Pick<
  Player,
  "id" | "firstName" | "lastName" | "position" | "nationality" | "preferredFoot" | "heightCm" | "marketValueEur" | "photoUrl" | "shirtNumber"
>;

interface LatestReport {
  date: string;
  recommendation: ReportRecommendation | null;
  excerpt: string | null;
}

export function PlayerSpotlightPanel({
  player,
  club,
  age,
  reportCount,
  latestReport,
}: {
  player: SpotlightPlayer;
  club: Pick<Club, "name"> | null;
  age: number | null;
  reportCount: number;
  latestReport: LatestReport | null;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-80 shrink-0 sm:h-96">
        <PlayerFutCard player={player} club={club} age={age} isFollowing />
      </div>

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rapports</p>
            <p className="text-sm font-semibold text-foreground">
              {reportCount === 0 ? "Aucun pour l'instant" : `${reportCount} enregistré${reportCount > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Target className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Recommandation</p>
            {latestReport ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {latestReport.recommendation ? RECOMMENDATION_LABELS[latestReport.recommendation] : "—"} ·{" "}
                  <span className="font-normal text-muted-foreground">{latestReport.date}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {latestReport.excerpt ?? "Rapport enregistré sans commentaire détaillé."}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun rapport pour l&apos;instant.{" "}
                <Link href={`/players/${player.id}`} className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground">
                  Rédiger le premier
                </Link>
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
