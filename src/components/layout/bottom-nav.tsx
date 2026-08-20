"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Search, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/players", label: "Joueurs", icon: Search },
  { href: "/shortlist", label: "Shortlist", icon: Star },
  { href: "/reports", label: "Rapports", icon: FileText },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-20 rounded-2xl md:hidden">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
