"use client";

import { useActionState } from "react";
import { createReportAction, type ReportActionState } from "@/server/actions/report.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RECOMMENDATION_LABELS } from "@/lib/recommendation";

export function CreateReportForm({ playerId }: { playerId: string }) {
  const [state, formAction, isPending] = useActionState<ReportActionState, FormData>(
    createReportAction.bind(null, playerId),
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium text-foreground">Nouveau rapport</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="context">Contexte</Label>
          <Input id="context" name="context" placeholder="Match, compétition, date..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rating">Note (/10)</Label>
          <Input id="rating" name="rating" type="number" min={0} max={10} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="strengths">Points forts</Label>
        <Input id="strengths" name="strengths" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weaknesses">Points faibles</Label>
        <Input id="weaknesses" name="weaknesses" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">Commentaire</Label>
        <Input id="comment" name="comment" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recommendation">Recommandation</Label>
        <Select name="recommendation">
          <SelectTrigger id="recommendation">
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RECOMMENDATION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Création..." : "Créer le rapport"}
      </Button>

      {state?.status === "success" && <p className="text-sm text-primary">{state.message}</p>}
      {state?.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
    </form>
  );
}
