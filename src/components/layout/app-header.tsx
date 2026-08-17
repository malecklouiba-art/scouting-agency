import { Logo } from "@/components/layout/logo";
import { HeaderSearch } from "@/components/layout/header-search";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOutAction } from "@/server/actions/auth.actions";
import type { User } from "@/generated/prisma/client";

function initials(user: Pick<User, "firstName" | "lastName" | "email">) {
  if (user.firstName) return user.firstName[0]!.toUpperCase();
  return user.email[0]!.toUpperCase();
}

export function AppHeader({
  user,
}: {
  user: Pick<User, "firstName" | "lastName" | "email"> | null;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <Logo />

      <HeaderSearch />

      {user && (
        <div className="ml-auto flex items-center gap-2">
          <Avatar>
            <AvatarFallback className="bg-secondary text-sm text-foreground">
              {initials(user)}
            </AvatarFallback>
          </Avatar>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
