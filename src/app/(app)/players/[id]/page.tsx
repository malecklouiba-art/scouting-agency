import { EmptyState } from "@/components/shared/empty-state";

const SECTIONS = [
  "Profil",
  "Statistiques",
  "Historique",
  "Transferts",
  "Rapports",
  "Notes personnelles",
];

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {SECTIONS.map((section) => (
          <span
            key={section}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground first:bg-secondary first:text-foreground"
          >
            {section}
          </span>
        ))}
      </div>

      <EmptyState
        title="Fiche joueur indisponible"
        description={`Aucune donnée n'est encore synchronisée pour le joueur "${id}". Cette fiche s'activera une fois le Data Provider Transfermarkt connecté et la base joueurs alimentée.`}
      />
    </div>
  );
}
