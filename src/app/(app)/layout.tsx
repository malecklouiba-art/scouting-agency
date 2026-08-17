import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getCurrentUser } from "@/server/auth/current-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader user={user} />
      <main className="flex-1 px-4 py-6 pb-24 sm:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}
