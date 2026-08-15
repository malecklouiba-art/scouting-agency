import { EmptyState } from "@/components/shared/empty-state";

export default function ShortlistPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Shortlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Les joueurs que vous suivez, avec leur statut et votre dernière
          note.
        </p>
      </div>

      <EmptyState
        title="Votre shortlist est vide"
        description="Ajoutez un joueur depuis sa fiche ou directement depuis le chat pour commencer à suivre vos priorités (À suivre, Intéressant, Prioritaire, Écarté)."
      />
    </div>
  );
}
