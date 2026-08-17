// Extraction défensive des arguments renvoyés par Gemini : le modèle suit le
// schéma déclaré dans l'immense majorité des cas, mais rien ne le garantit
// au niveau du type-system — cette frontière (sortie de modèle) mérite une
// validation légère plutôt qu'un cast aveugle.

export function str(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function requireStr(args: Record<string, unknown>, key: string): string {
  const value = str(args, key);
  if (!value) throw new Error(`Argument requis manquant ou invalide: ${key}`);
  return value;
}

export function num(args: Record<string, unknown>, key: string): number | undefined {
  const value = args[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function strArray(args: Record<string, unknown>, key: string): string[] | undefined {
  const value = args[key];
  if (!Array.isArray(value)) return undefined;
  const filtered = value.filter((item): item is string => typeof item === "string");
  return filtered.length > 0 ? filtered : undefined;
}

export function requireStrArray(args: Record<string, unknown>, key: string): string[] {
  const value = strArray(args, key);
  if (!value) throw new Error(`Argument requis manquant ou invalide: ${key}`);
  return value;
}

export function oneOf<T extends string>(args: Record<string, unknown>, key: string, allowed: readonly T[]): T | undefined {
  const value = args[key];
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}
