import { getCurrentUser } from "@/server/auth/current-user";
import { getShortlistPlayers } from "@/server/services/shortlist.service";
import { toPlayerSummary } from "@/server/services/player.service";
import { EmptyState } from "@/components/shared/empty-state";
import { ShortlistRow } from "@/components/shortlist/shortlist-row";

export default async function ShortlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const entries = await getShortlistPlayers({ organizationId: user.organizationId, ownerId: user.id });
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Shortlist</h1>
        <p className="text-sm text-muted-foreground">
          Les joueurs que vous suivez, avec leur statut et votre dernière note.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Votre shortlist est vide"
          description="Ajoutez un joueur depuis sa fiche ou directement depuis le chat pour commencer à suivre vos priorités (À suivre, Intéressant, Prioritaire, Écarté)."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <ShortlistRow
              key={entry.id}
              player={toPlayerSummary(entry.player)}
              status={entry.status}
              note={entry.lastNote}
              addedAt={dateFormatter.format(entry.addedAt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
