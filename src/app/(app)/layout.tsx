import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LeftSidebar } from "@/components/layout/left-sidebar";
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
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+6rem)] sm:px-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
