import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FOOT_LABELS } from "@/lib/foot";
import { placeholderPhotoUrl } from "@/lib/avatar";
import { FollowButton } from "@/components/players/follow-button";
import type { PlayerSummary } from "@/server/services/player.service";

function formatCompactEur(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function PlayersTable({
  rows,
}: {
  rows: Array<{ player: PlayerSummary; score?: number; isFollowing?: boolean }>;
}) {
  const showScore = rows.some((row) => typeof row.score === "number");

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm ring-1 ring-foreground/[0.06]">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Joueur</th>
            <th className="px-3 py-2 font-medium">Poste</th>
            <th className="px-3 py-2 text-right font-medium">Âge</th>
            <th className="px-3 py-2 font-medium">Nationalité</th>
            <th className="px-3 py-2 font-medium">Club</th>
            <th className="px-3 py-2 font-medium">Pied</th>
            <th className="px-3 py-2 text-right font-medium">Valeur</th>
            {showScore && <th className="px-3 py-2 text-right font-medium">Score</th>}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, score, isFollowing }) => (
            <tr key={player.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
              <td className="px-3 py-2">
                <Link href={`/players/${player.id}`} className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarImage
                      src={player.photoUrl ?? placeholderPhotoUrl(player.id)}
                      alt={`${player.firstName} ${player.lastName}`}
                    />
                    <AvatarFallback className="text-[10px]">
                      {player.firstName[0]}
                      {player.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground hover:underline">
                    {player.firstName} {player.lastName}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{player.positionLabel ?? "—"}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">{player.age ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{player.nationality ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{player.clubName ?? "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {player.preferredFoot ? FOOT_LABELS[player.preferredFoot] : "—"}
              </td>
              <td className="px-3 py-2 text-right text-muted-foreground">{formatCompactEur(player.marketValueEur)}</td>
              {showScore && (
                <td className="px-3 py-2 text-right font-medium text-foreground">
                  {typeof score === "number" ? `${score}/100` : "—"}
                </td>
              )}
              <td className="px-3 py-2 text-right">
                <FollowButton
                  playerId={player.id}
                  initialFollowing={isFollowing ?? false}
                  size="icon-sm"
                  label={false}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
