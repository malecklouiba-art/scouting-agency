import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-3.5" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}
