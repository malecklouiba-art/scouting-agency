"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Home, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/players", label: "Joueurs", icon: Search },
  { href: "/shortlist", label: "Shortlist", icon: Star },
  { href: "/reports", label: "Rapports", icon: FileText },
] as const;

const STORAGE_KEY = "scoutpro:sidebar-collapsed";

export function LeftSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <nav
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-card py-4 transition-[width] duration-150 md:flex",
        collapsed ? "w-16 px-2" : "w-56 px-3",
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-secondary text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        title={collapsed ? "Déplier le menu" : "Replier le menu"}
        className={cn(
          "mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        {collapsed ? <ChevronRight className="size-4 shrink-0" /> : <ChevronLeft className="size-4 shrink-0" />}
        {!collapsed && "Replier"}
      </button>
    </nav>
  );
}
