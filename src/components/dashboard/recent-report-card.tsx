import Link from "next/link";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RECOMMENDATION_BADGE_VARIANT, RECOMMENDATION_LABELS } from "@/lib/recommendation";
import { cn } from "@/lib/utils";
import type { ReportRecommendation } from "@/generated/prisma/client";

export function RecentReportCard({
  reportId,
  playerName,
  authorName,
  date,
  recommendation,
  featured = false,
}: {
  reportId: string;
  playerName: string;
  authorName: string;
  date: string;
  recommendation: ReportRecommendation | null;
  featured?: boolean;
}) {
  return (
    <Link href={`/reports/${reportId}`}>
      <Card
        className={cn(
          "flex h-full flex-col gap-4 p-4 transition-colors",
          featured ? "bg-primary text-primary-foreground" : "hover:border-primary/40",
        )}
      >
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full",
              featured ? "bg-primary-foreground/15" : "bg-secondary text-primary",
            )}
          >
            <FileText className="size-4" />
          </div>
          {recommendation &&
            (featured ? (
              <span className="text-xs font-semibold">{RECOMMENDATION_LABELS[recommendation]}</span>
            ) : (
              <Badge variant={RECOMMENDATION_BADGE_VARIANT[recommendation]}>
                {RECOMMENDATION_LABELS[recommendation]}
              </Badge>
            ))}
        </div>
        <div>
          <p className="text-sm font-semibold">{playerName}</p>
          <p className={cn("text-xs", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {date} · {authorName}
          </p>
        </div>
      </Card>
    </Link>
  );
}
