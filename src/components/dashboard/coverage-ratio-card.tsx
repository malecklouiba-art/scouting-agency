import { Card } from "@/components/ui/card";

export function CoverageRatioCard({ withReport, total }: { withReport: number; total: number }) {
  const withPct = total === 0 ? 0 : Math.round((withReport / total) * 100);
  const withoutPct = 100 - withPct;

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold text-foreground">Couverture des rapports</p>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun joueur suivi pour l&apos;instant.</p>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avec rapport · {withPct}%</span>
            <span>Sans rapport · {withoutPct}%</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="bg-primary" style={{ width: `${withPct}%` }} />
          </div>
          <p className="text-center text-2xl font-bold text-foreground">
            {withReport}
            <span className="text-sm font-normal text-muted-foreground"> / {total} suivis</span>
          </p>
        </>
      )}
    </Card>
  );
}
