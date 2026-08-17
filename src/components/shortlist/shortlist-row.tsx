"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { removeFromShortlistAction } from "@/server/actions/shortlist.actions";
import { SHORTLIST_STATUS_BADGE_VARIANT, SHORTLIST_STATUS_LABELS } from "@/lib/shortlist-status";
import type { PlayerSummary } from "@/server/services/player.service";
import type { ShortlistStatus } from "@/generated/prisma/client";

export function ShortlistRow({
  player,
  status,
  note,
  addedAt,
}: {
  player: PlayerSummary;
  status: ShortlistStatus;
  note: string | null;
  addedAt: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <Link href={`/players/${player.id}`} className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {player.firstName} {player.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {[player.positionLabel, player.clubName, player.age ? `${player.age} ans` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {note && <p className="mt-1 text-xs text-muted-foreground italic">{note}</p>}
      </Link>

      <div className="flex items-center gap-2">
        <Badge variant={SHORTLIST_STATUS_BADGE_VARIANT[status]}>{SHORTLIST_STATUS_LABELS[status]}</Badge>
        <span className="text-xs text-muted-foreground">{addedAt}</span>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => startTransition(() => removeFromShortlistAction(player.id))}
        >
          Retirer
        </Button>
      </div>
    </Card>
  );
}
