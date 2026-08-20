import type { LucideIcon } from "lucide-react";

export function InlineStat({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xl leading-none font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
