import { FollowButton } from "@/components/players/follow-button";
import { placeholderPhotoUrl } from "@/lib/avatar";
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
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-800 via-neutral-900 to-black p-5 text-foreground shadow-lg">
      {/* Reflet diagonal façon verre — pure décoration, ne doit jamais intercepter les clics */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent"
      />

      <div className="glass-on-color absolute top-4 left-4 flex flex-col items-center gap-0 rounded-lg px-2.5 py-1.5 leading-none">
        <span className="text-2xl font-bold">{player.position ?? "?"}</span>
        {player.shirtNumber && <span className="mt-1 text-xs font-medium opacity-80">#{player.shirtNumber}</span>}
      </div>

      <div className="absolute top-4 right-4">
        <FollowButton playerId={player.id} initialFollowing={isFollowing} size="icon-sm" label={false} />
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder/synced photo, faded into the card via mask instead of a boxed frame */}
        <img
          src={player.photoUrl ?? placeholderPhotoUrl(player.id)}
          alt={`${player.firstName} ${player.lastName}`}
          className="size-44 object-contain"
          style={{
            maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          }}
        />

        <div className="text-center">
          <h1 className="text-lg font-bold tracking-wide uppercase">
            {player.firstName} {player.lastName}
          </h1>
          <p className="text-sm opacity-80">{[club?.name, player.nationality].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="glass-on-color rounded-lg px-2 py-1.5">
          <p className="text-xs opacity-70">Âge</p>
          <p className="text-sm font-semibold">{age ?? "—"}</p>
        </div>
        <div className="glass-on-color rounded-lg px-2 py-1.5">
          <p className="text-xs opacity-70">Taille</p>
          <p className="text-sm font-semibold">{player.heightCm ? `${player.heightCm} cm` : "—"}</p>
        </div>
        <div className="glass-on-color rounded-lg px-2 py-1.5">
          <p className="text-xs opacity-70">Pied</p>
          <p className="text-sm font-semibold">{player.preferredFoot ? FOOT_LABELS[player.preferredFoot] : "—"}</p>
        </div>
      </div>

      <div className="glass-on-color mt-auto rounded-lg px-3 py-2 text-center">
        <p className="text-xs opacity-70">Valeur marchande</p>
        <p className="text-sm font-semibold">{formatCompactEur(player.marketValueEur)}</p>
      </div>
    </div>
  );
}
