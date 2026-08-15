import { EmptyState } from "@/components/shared/empty-state";

export default function ReportsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Rapports
        </h1>
        <p className="text-sm text-muted-foreground">
          Vos rapports d&apos;observation, avec recommandation et contexte.
        </p>
      </div>

      <EmptyState
        title="Aucun rapport pour l'instant"
        description="Créez un rapport depuis une fiche joueur, ou laissez Gemini transformer un texte libre en rapport structuré."
      />
    </div>
  );
}
