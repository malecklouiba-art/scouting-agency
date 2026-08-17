import type { Foot } from "../types";

/** "€180.00m" / "€850k" / "-" -> euros entiers. Formats Transfermarkt connus. */
export function parseMarketValueEur(raw: string | null | undefined): number | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed === "-") return null;
  const match = trimmed.replace(/[€,]/g, "").match(/^([\d.]+)\s*([mk])?$/i);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  if (Number.isNaN(value)) return null;
  const unit = match[2]?.toLowerCase();
  const multiplier = unit === "m" ? 1_000_000 : unit === "k" ? 1_000 : 1;
  return Math.round(value * multiplier);
}

/** Les frais de transfert incluent des libellés texte ("loan", "free", "?") en plus des montants. */
export function parseTransferFee(raw: string | null | undefined): number | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed === "-" || trimmed === "?") return null;
  if (/loan|free/i.test(trimmed)) return null;
  return parseMarketValueEur(trimmed);
}

export function isLoanTransfer(raw: string | null | undefined): boolean {
  return /loan/i.test(raw ?? "");
}

/** "1,85 m" (virgule décimale européenne) -> centimètres. */
export function parseHeightCm(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.replace(",", ".").match(/([\d.]+)\s*m/i);
  if (!match) return null;
  const meters = Number.parseFloat(match[1]);
  return Number.isNaN(meters) ? null : Math.round(meters * 100);
}

export function parseFoot(raw: string | null | undefined): Foot | null {
  switch (raw?.trim().toLowerCase()) {
    case "right":
      return "RIGHT";
    case "left":
      return "LEFT";
    case "both":
      return "BOTH";
    default:
      return null;
  }
}

export function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseShirtNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? null : value;
}
