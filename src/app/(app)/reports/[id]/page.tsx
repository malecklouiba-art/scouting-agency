import { EmptyState } from "@/components/shared/empty-state";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Rapport
      </h1>

      <EmptyState
        title="Rapport indisponible"
        description={`Le rapport "${id}" n'existe pas encore. La création de rapports arrive avec la base joueurs et les fiches individuelles.`}
      />
    </div>
  );
}
