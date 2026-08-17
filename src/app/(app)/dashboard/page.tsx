import { ChatPanel } from "@/components/dashboard/chat-panel";
import { getCurrentUser } from "@/server/auth/current-user";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <ChatPanel firstName={user?.firstName ?? null} />;
}
