import type { Foot } from "@/generated/prisma/client";

export const FOOT_LABELS: Record<Foot, string> = {
  LEFT: "Gauche",
  RIGHT: "Droit",
  BOTH: "Ambidextre",
};

const CODE_BY_LABEL = new Map(
  Object.entries(FOOT_LABELS).map(([code, label]) => [label.toLowerCase(), code as Foot]),
);

/** Accepte le code (LEFT/RIGHT/BOTH) ou le libellé français, insensible à la casse — pour le CSV rempli à la main. */
export function footCodeFromInput(raw: string | null | undefined): Foot | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.toUpperCase() in FOOT_LABELS) return trimmed.toUpperCase() as Foot;
  return CODE_BY_LABEL.get(trimmed.toLowerCase()) ?? null;
}
