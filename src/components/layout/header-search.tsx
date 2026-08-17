"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  const router = useRouter();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const value = event.currentTarget.value.trim();
    if (!value) return;
    router.push(`/players?q=${encodeURIComponent(value)}`);
  }

  return (
    <div className="relative ml-2 max-w-md flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher un joueur, un club..."
        className="pl-9"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
