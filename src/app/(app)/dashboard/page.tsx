import { ChatPrompt } from "@/components/dashboard/chat-prompt";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Bonjour
        </h1>
        <p className="text-lg text-muted-foreground">
          Que recherchez-vous aujourd&apos;hui ?
        </p>
      </div>

      <ChatPrompt />
    </div>
  );
}
