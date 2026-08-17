import Link from "next/link";
import { FOOT_LABELS } from "@/lib/foot";
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

export function PlayersTable({ rows }: { rows: Array<{ player: PlayerSummary; score?: number }> }) {
  const showScore = rows.some((row) => typeof row.score === "number");

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full min-w-[720px] border-collapse text-sm">
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
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, score }) => (
            <tr key={player.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
              <td className="px-3 py-2">
                <Link href={`/players/${player.id}`} className="font-medium text-foreground hover:text-primary">
                  {player.firstName} {player.lastName}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
