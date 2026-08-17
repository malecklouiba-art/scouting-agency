"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoPlayersAction } from "@/server/actions/players.actions";

export function SeedDemoDataButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const result = await seedDemoPlayersAction();
      setMessage(
        result?.status === "success"
          ? `${result.imported} joueur${result.imported > 1 ? "s" : ""} de démo ajouté${result.imported > 1 ? "s" : ""}.`
          : (result?.message ?? "Une erreur est survenue."),
      );
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={handleClick} disabled={isPending}>
        <Sparkles className="size-4" />
        {isPending ? "Chargement..." : "Charger des données de démo"}
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
