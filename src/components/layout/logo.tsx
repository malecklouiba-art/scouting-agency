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
      Scout<span className="rounded-md bg-primary px-1 text-primary-foreground">Pro</span>
    </Link>
  );
}
