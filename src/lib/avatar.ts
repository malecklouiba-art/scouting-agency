/**
 * Photo de repli pour illustrer un joueur sans photoUrl réelle (démo, import
 * CSV, ou sync Transfermarkt qui n'a encore jamais réussi côté production).
 * Déterministe par seed (id joueur) — un pravatar.cc généré, jamais confondu
 * avec une vraie photo puisqu'aucun champ en base n'est modifié : dès qu'un
 * photoUrl réel existe, il prend le dessus.
 */
export function placeholderPhotoUrl(seed: string): string {
  return `https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`;
}
