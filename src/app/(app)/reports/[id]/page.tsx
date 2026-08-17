import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { positionLabel } from "@/lib/positions";
import { RECOMMENDATION_BADGE_VARIANT, RECOMMENDATION_LABELS } from "@/lib/recommendation";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { player: true, author: true },
  });

  if (!report) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rapport</h1>
        <EmptyState title="Rapport introuvable" description="Ce rapport n'existe pas ou a été supprimé." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <Link href={`/players/${report.player.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {report.player.firstName} {report.player.lastName}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Rapport — {positionLabel(report.player.position) ?? "Poste inconnu"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(report.date)} · {report.author.firstName ?? report.author.email}
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-5">
        {report.recommendation && (
          <div>
            <Badge variant={RECOMMENDATION_BADGE_VARIANT[report.recommendation]}>
              {RECOMMENDATION_LABELS[report.recommendation]}
            </Badge>
          </div>
        )}

        {report.context && (
          <div>
            <p className="text-xs text-muted-foreground">Contexte</p>
            <p className="text-sm text-foreground">{report.context}</p>
          </div>
        )}

        {report.rating !== null && (
          <div>
            <p className="text-xs text-muted-foreground">Note</p>
            <p className="text-sm text-foreground">{report.rating}/10</p>
          </div>
        )}

        {report.strengths && (
          <div>
            <p className="text-xs text-muted-foreground">Points forts</p>
            <p className="text-sm text-foreground">{report.strengths}</p>
          </div>
        )}

        {report.weaknesses && (
          <div>
            <p className="text-xs text-muted-foreground">Points faibles</p>
            <p className="text-sm text-foreground">{report.weaknesses}</p>
          </div>
        )}

        {report.comment && (
          <div>
            <p className="text-xs text-muted-foreground">Commentaire</p>
            <p className="text-sm text-foreground">{report.comment}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
