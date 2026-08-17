import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/players/follow-button";
import type { PlayerSummary } from "@/server/services/player.service";

export function PlayerCard({
  player,
  score,
  isFollowing = false,
}: {
  player: PlayerSummary;
  score?: number;
  isFollowing?: boolean;
}) {
  return (
    <Link href={`/players/${player.id}`}>
      <Card className="flex flex-row items-center justify-between gap-3 p-3 transition-colors hover:border-primary/40">
        <div>
          <p className="text-sm font-medium text-foreground">
            {player.firstName} {player.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {[player.positionLabel, player.clubName, player.age ? `${player.age} ans` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {typeof score === "number" && <Badge variant="secondary">{score}/100</Badge>}
          <FollowButton playerId={player.id} initialFollowing={isFollowing} size="icon-sm" label={false} />
        </div>
      </Card>
    </Link>
  );
}
