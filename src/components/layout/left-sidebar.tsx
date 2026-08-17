"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, FileText, Home, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/players", label: "Joueurs", icon: Search },
  { href: "/shortlist", label: "Shortlist", icon: Star },
  { href: "/reports", label: "Rapports", icon: FileText },
] as const;

const STORAGE_KEY = "scoutpro:sidebar-collapsed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

export function LeftSidebar() {
  const pathname = usePathname();
  // localStorage n'existe pas côté serveur — useSyncExternalStore rend
  // toujours getServerSnapshot() au premier passage (SSR + hydratation),
  // évitant le mismatch qu'un useEffect+setState provoquerait ici.
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    localStorage.setItem(STORAGE_KEY, collapsed ? "0" : "1");
    // "storage" ne se déclenche jamais dans l'onglet qui écrit lui-même —
    // on le redéclenche à la main pour que ce clic se reflète immédiatement.
    window.dispatchEvent(new StorageEvent("storage"));
  }

  return (
    <nav
      className={cn(
        "glass hidden shrink-0 flex-col py-4 transition-[width] duration-150 md:flex",
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
