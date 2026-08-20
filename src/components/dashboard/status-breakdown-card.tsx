import { Card } from "@/components/ui/card";
import { SHORTLIST_STATUS_DOT_CLASS, SHORTLIST_STATUS_LABELS } from "@/lib/shortlist-status";
import { cn } from "@/lib/utils";
import type { ShortlistStatus } from "@/generated/prisma/client";

const STATUS_ORDER: ShortlistStatus[] = ["PRIORITY", "INTERESTING", "TO_WATCH", "DISCARDED"];

export function StatusBreakdownCard({ counts }: { counts: Record<ShortlistStatus, number> }) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold text-foreground">Répartition de la shortlist</p>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun joueur suivi pour l&apos;instant.</p>
      ) : (
        <>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            {STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => (
              <div
                key={status}
                className={SHORTLIST_STATUS_DOT_CLASS[status]}
                style={{ width: `${(counts[status] / total) * 100}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span className={cn("size-2 shrink-0 rounded-full", SHORTLIST_STATUS_DOT_CLASS[status])} />
                <span className="text-xs text-muted-foreground">{SHORTLIST_STATUS_LABELS[status]}</span>
                <span className="ml-auto text-xs font-semibold text-foreground">
                  {counts[status]} · {Math.round((counts[status] / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
