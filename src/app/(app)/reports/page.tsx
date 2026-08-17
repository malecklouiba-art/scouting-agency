import Link from "next/link";
import { getCurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RECOMMENDATION_BADGE_VARIANT, RECOMMENDATION_LABELS } from "@/lib/recommendation";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const reports = await prisma.report.findMany({
    where: { organizationId: user.organizationId },
    include: { player: true, author: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rapports</h1>
        <p className="text-sm text-muted-foreground">
          Vos rapports d&apos;observation, avec recommandation et contexte.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="Aucun rapport pour l'instant"
          description="Créez un rapport depuis une fiche joueur, ou laissez Gemini transformer un texte libre en rapport structuré."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="flex flex-row items-center justify-between gap-3 p-3 transition-colors hover:border-primary/40">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {report.player.firstName} {report.player.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dateFormatter.format(report.date)} · {report.author.firstName ?? report.author.email}
                  </p>
                </div>
                {report.recommendation && (
                  <Badge variant={RECOMMENDATION_BADGE_VARIANT[report.recommendation]}>
                    {RECOMMENDATION_LABELS[report.recommendation]}
                  </Badge>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
