/**
 * Taxonomie de postes commune à tout ScoutPro : code interne (stocké sur
 * Player.position), libellé français (UI, recherche), synonymes anglais
 * Transfermarkt (normalisation à la synchro — voir
 * services/data-provider/transfermarkt/transfermarkt.mapper.ts).
 */
export interface PositionDefinition {
  code: string;
  label: string;
  sourceSynonyms: string[];
}

export const POSITIONS: PositionDefinition[] = [
  { code: "GK", label: "Gardien", sourceSynonyms: ["goalkeeper"] },
  { code: "CB", label: "Défenseur central", sourceSynonyms: ["centre-back", "center-back", "sweeper"] },
  { code: "LB", label: "Latéral gauche", sourceSynonyms: ["left-back", "left back", "left wing-back"] },
  { code: "RB", label: "Latéral droit", sourceSynonyms: ["right-back", "right back", "right wing-back"] },
  { code: "DM", label: "Milieu défensif", sourceSynonyms: ["defensive midfield"] },
  { code: "CM", label: "Milieu central", sourceSynonyms: ["central midfield"] },
  { code: "AM", label: "Milieu offensif", sourceSynonyms: ["attacking midfield"] },
  { code: "LW", label: "Ailier gauche", sourceSynonyms: ["left winger", "left midfield"] },
  { code: "RW", label: "Ailier droit", sourceSynonyms: ["right winger", "right midfield"] },
  { code: "ST", label: "Attaquant", sourceSynonyms: ["centre-forward", "center-forward", "striker", "second striker"] },
];

const CODE_BY_SOURCE_SYNONYM = new Map(
  POSITIONS.flatMap((position) => position.sourceSynonyms.map((synonym) => [synonym, position.code])),
);

const CODE_BY_LABEL = new Map(POSITIONS.map((position) => [normalizeText(position.label), position.code]));

// Alias courts non ambigus seulement — "défenseur", "milieu", "ailier" seuls
// désignent plusieurs postes possibles : mieux vaut ne pas filtrer que
// filtrer sur le mauvais poste.
const UNAMBIGUOUS_ALIASES = new Map([
  ["gardien", "GK"],
  ["attaquant", "ST"],
  ["buteur", "ST"],
]);

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Position brute Transfermarkt (anglais) -> code interne. */
export function positionCodeFromSource(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return CODE_BY_SOURCE_SYNONYM.get(raw.trim().toLowerCase()) ?? null;
}

/** Libellé français (saisi par un utilisateur ou proposé par Gemini) -> code interne. */
export function positionCodeFromLabel(label: string | null | undefined): string | null {
  if (!label) return null;
  const normalized = normalizeText(label);
  return CODE_BY_LABEL.get(normalized) ?? UNAMBIGUOUS_ALIASES.get(normalized) ?? null;
}

export function positionLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  return POSITIONS.find((position) => position.code === code)?.label ?? code;
}
