import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { MainNav } from "@/components/layout/main-nav";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="flex items-center gap-4">
        <Logo />

        <div className="relative ml-2 flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un joueur, un club..."
            className="pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            <Sparkles className="size-4" />
            Assistant IA
          </Link>
          <Avatar>
            <AvatarFallback className="bg-secondary text-sm text-foreground">
              ?
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <MainNav />
    </header>
  );
}
