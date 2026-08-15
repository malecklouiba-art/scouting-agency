import { cn } from "@/lib/utils";
import type { AuthActionState } from "@/server/actions/auth.actions";

export function FormMessage({ state }: { state: AuthActionState }) {
  if (!state) return null;

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        state.status === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground",
      )}
    >
      {state.message}
    </p>
  );
}
