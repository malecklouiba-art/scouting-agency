import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      Scout<span className="text-primary">Pro</span>
    </Link>
  );
}
