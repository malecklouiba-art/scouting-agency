"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POSITIONS } from "@/lib/positions";
import { FOOT_LABELS } from "@/lib/foot";

export function PlayersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="relative flex-1"
        onSubmit={(event) => {
          event.preventDefault();
          updateParam("q", name || null);
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nom du joueur"
          className="pl-9"
        />
      </form>

      <Select
        value={searchParams.get("position") ?? undefined}
        onValueChange={(value) => updateParam("position", typeof value === "string" ? value : null)}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Position" />
        </SelectTrigger>
        <SelectContent>
          {POSITIONS.map((position) => (
            <SelectItem key={position.code} value={position.code}>
              {position.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("foot") ?? undefined}
        onValueChange={(value) => updateParam("foot", typeof value === "string" ? value : null)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Pied" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(FOOT_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
