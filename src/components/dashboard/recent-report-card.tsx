import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RECOMMENDATION_BADGE_VARIANT, RECOMMENDATION_LABELS } from "@/lib/recommendation";
import type { ReportRecommendation } from "@/generated/prisma/client";

export function RecentReportCard({
  reportId,
  playerName,
  authorName,
  date,
  recommendation,
}: {
  reportId: string;
  playerName: string;
  authorName: string;
  date: string;
  recommendation: ReportRecommendation | null;
}) {
  return (
    <Link href={`/reports/${reportId}`}>
      <Card className="flex flex-row items-center justify-between gap-3 p-3 transition-colors hover:border-primary/40">
        <div>
          <p className="text-sm font-medium text-foreground">{playerName}</p>
          <p className="text-xs text-muted-foreground">
            {date} · {authorName}
          </p>
        </div>
        {recommendation && (
          <Badge variant={RECOMMENDATION_BADGE_VARIANT[recommendation]}>{RECOMMENDATION_LABELS[recommendation]}</Badge>
        )}
      </Card>
    </Link>
  );
}
