import Link from "next/link";
import { PlayerFutCard } from "@/components/players/player-fut-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RECOMMENDATION_BADGE_VARIANT, RECOMMENDATION_LABELS } from "@/lib/recommendation";
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
  latestReport,
}: {
  player: SpotlightPlayer;
  club: Pick<Club, "name"> | null;
  age: number | null;
  latestReport: LatestReport | null;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-80 shrink-0 sm:h-96">
        <PlayerFutCard player={player} club={club} age={age} isFollowing />
      </div>

      <Card className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Synthèse</p>
          {latestReport?.recommendation && (
            <Badge variant={RECOMMENDATION_BADGE_VARIANT[latestReport.recommendation]}>
              {RECOMMENDATION_LABELS[latestReport.recommendation]}
            </Badge>
          )}
        </div>
        {latestReport ? (
          <>
            <p className="text-xs text-muted-foreground">Dernier rapport · {latestReport.date}</p>
            <p className="text-sm text-foreground">
              {latestReport.excerpt ?? "Rapport enregistré sans commentaire détaillé."}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun rapport pour l&apos;instant.{" "}
            <Link href={`/players/${player.id}`} className="font-medium text-primary hover:underline">
              Rédiger le premier
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
