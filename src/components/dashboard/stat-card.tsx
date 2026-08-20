import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card className="flex flex-row items-center gap-3 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
