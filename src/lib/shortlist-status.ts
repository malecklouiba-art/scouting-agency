import type { ShortlistStatus } from "@/generated/prisma/client";

export const SHORTLIST_STATUS_LABELS: Record<ShortlistStatus, string> = {
  TO_WATCH: "À suivre",
  INTERESTING: "Intéressant",
  PRIORITY: "Prioritaire",
  DISCARDED: "Écarté",
};

/** Hiérarchie visuelle : un statut Prioritaire doit se voir au premier coup d'œil, un Écarté doit s'effacer. */
export const SHORTLIST_STATUS_BADGE_VARIANT: Record<ShortlistStatus, "default" | "secondary" | "outline" | "destructive"> = {
  TO_WATCH: "outline",
  INTERESTING: "secondary",
  PRIORITY: "default",
  DISCARDED: "destructive",
};

/** Pastille de statut compacte (tuiles dashboard) — dérivée des tokens existants, pas de couleur codée en dur. */
export const SHORTLIST_STATUS_DOT_CLASS: Record<ShortlistStatus, string> = {
  TO_WATCH: "bg-muted-foreground",
  INTERESTING: "bg-foreground/60",
  PRIORITY: "bg-primary",
  DISCARDED: "bg-destructive",
};
