"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EXAMPLES = [
  "Trouve-moi des défenseurs U23 en Belgique.",
  "Compare mes deux meilleurs milieux.",
  "Montre-moi les joueurs que j'ai ajoutés récemment.",
  "Trouve des joueurs similaires à ce profil.",
];

export function ChatPrompt() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="flex flex-row items-center gap-2 p-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Je cherche un défenseur central de moins de 23 ans, rapide, bon dans les duels..."
          className="h-11 border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button size="icon" disabled={value.trim().length === 0}>
          <ArrowUp className="size-4" />
        </Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setValue(example)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
