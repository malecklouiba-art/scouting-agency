"use client";

import { useActionState, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { importPlayersCsvAction, type ImportActionState } from "@/server/actions/players.actions";

export function ImportExportButtons() {
  const [state, formAction, isPending] = useActionState<ImportActionState, FormData>(importPlayersCsvAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <a href="/api/players/export" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
          <Download className="size-4" />
          Exporter en CSV
        </a>

        <form ref={formRef} action={formAction}>
          <label className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "cursor-pointer")}>
            <Upload className="size-4" />
            {isPending ? "Import..." : "Importer un CSV"}
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={isPending}
              onChange={() => formRef.current?.requestSubmit()}
            />
          </label>
        </form>
      </div>

      {state?.status === "success" && (
        <p className="text-sm text-muted-foreground">
          {state.imported} joueur{state.imported > 1 ? "s" : ""} importé{state.imported > 1 ? "s" : ""}.
          {state.errors.length > 0 && ` ${state.errors.length} ligne(s) ignorée(s) — vérifie firstName/lastName.`}
        </p>
      )}
      {state?.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
    </div>
  );
}
