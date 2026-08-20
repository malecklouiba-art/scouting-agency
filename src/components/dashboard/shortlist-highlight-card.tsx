import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { placeholderPhotoUrl } from "@/lib/avatar";
import { SHORTLIST_STATUS_DOT_CLASS, SHORTLIST_STATUS_LABELS } from "@/lib/shortlist-status";
import { cn } from "@/lib/utils";
import type { PlayerSummary } from "@/server/services/player.service";
import type { ShortlistStatus } from "@/generated/prisma/client";

export function ShortlistHighlightCard({ player, status }: { player: PlayerSummary; status: ShortlistStatus }) {
  return (
    <Link href={`/players/${player.id}`}>
      <Card className="flex flex-col gap-3 p-4 transition-colors hover:border-primary/40">
        <div className="flex items-start justify-between">
          <Avatar size="lg">
            <AvatarImage
              src={player.photoUrl ?? placeholderPhotoUrl(player.id)}
              alt={`${player.firstName} ${player.lastName}`}
            />
            <AvatarFallback>
              {player.firstName[0]}
              {player.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {player.firstName} {player.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {[player.positionLabel, player.clubName].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", SHORTLIST_STATUS_DOT_CLASS[status])} />
          <span className="text-xs text-muted-foreground">{SHORTLIST_STATUS_LABELS[status]}</span>
        </div>
      </Card>
    </Link>
  );
}
