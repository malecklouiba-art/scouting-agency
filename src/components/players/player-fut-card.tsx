import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/players/follow-button";
import { FOOT_LABELS } from "@/lib/foot";
import type { Club, Player } from "@/generated/prisma/client";

function formatCompactEur(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

type FutCardPlayer = Pick<
  Player,
  "id" | "firstName" | "lastName" | "position" | "nationality" | "preferredFoot" | "heightCm" | "marketValueEur" | "photoUrl" | "shirtNumber"
>;

/**
 * Header de la fiche joueur inspiré des cartes FUT (EA Sports FC) — demandé
 * explicitement, en complément (pas remplacement) du détail texte de
 * l'onglet Profil juste en dessous. photoUrl est encore vide pour la
 * quasi-totalité des joueurs (démo/CSV, sync Transfermarkt jamais réussi) :
 * l'initiale stylisée en repli est honnête, on ne simule pas de photo.
 */
export function PlayerFutCard({
  player,
  club,
  age,
  isFollowing,
}: {
  player: FutCardPlayer;
  club: Pick<Club, "name"> | null;
  age: number | null;
  isFollowing: boolean;
}) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-xs flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-primary via-primary/85 to-primary/55 p-5 text-primary-foreground shadow-lg sm:mx-0">
      <div className="absolute top-4 left-4 flex flex-col items-center leading-none">
        <span className="text-2xl font-bold">{player.position ?? "?"}</span>
        {player.shirtNumber && <span className="mt-1 text-xs font-medium opacity-80">#{player.shirtNumber}</span>}
      </div>

      <div className="absolute top-4 right-4">
        <FollowButton playerId={player.id} initialFollowing={isFollowing} size="icon-sm" label={false} />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Avatar className="size-28 border-4 border-primary-foreground/30 shadow-md">
          <AvatarImage src={player.photoUrl ?? undefined} alt={`${player.firstName} ${player.lastName}`} />
          <AvatarFallback className="bg-primary-foreground/10 text-3xl font-semibold">
            {player.firstName[0]}
            {player.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h1 className="text-lg font-bold tracking-wide uppercase">
            {player.firstName} {player.lastName}
          </h1>
          <p className="text-sm opacity-80">{[club?.name, player.nationality].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-primary-foreground/20 pt-4 text-center">
        <div>
          <p className="text-xs opacity-70">Âge</p>
          <p className="text-sm font-semibold">{age ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs opacity-70">Taille</p>
          <p className="text-sm font-semibold">{player.heightCm ? `${player.heightCm} cm` : "—"}</p>
        </div>
        <div>
          <p className="text-xs opacity-70">Pied</p>
          <p className="text-sm font-semibold">{player.preferredFoot ? FOOT_LABELS[player.preferredFoot] : "—"}</p>
        </div>
      </div>

      <div className="mt-auto rounded-lg bg-primary-foreground/10 px-3 py-2 text-center">
        <p className="text-xs opacity-70">Valeur marchande</p>
        <p className="text-sm font-semibold">{formatCompactEur(player.marketValueEur)}</p>
      </div>
    </div>
  );
}
