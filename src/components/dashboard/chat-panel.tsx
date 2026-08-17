"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { confirmPendingActionAction } from "@/server/actions/chat.actions";
import { PlayerCard } from "@/components/players/player-card";
import type { PlayerSummary } from "@/server/services/player.service";

const EXAMPLES = [
  "Trouve-moi des défenseurs U23 en Belgique.",
  "Compare mes deux meilleurs milieux.",
  "Montre-moi les joueurs que j'ai ajoutés récemment.",
  "Trouve des joueurs similaires à ce profil.",
];

interface PlayerResult extends PlayerSummary {
  score?: number;
}

interface PendingAction {
  functionName: string;
  args: Record<string, unknown>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  players?: PlayerResult[];
  pendingAction?: PendingAction;
  resolved?: boolean;
}

export function ChatPanel({ firstName }: { firstName: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setValue("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId }),
      });
      if (!response.ok) throw new Error("request failed");
      const result = await response.json();

      setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.reply,
          players: Array.isArray(result.data?.players) ? result.data.players : undefined,
          pendingAction: result.pendingAction ?? undefined,
        },
      ]);
    } catch {
      setError("Impossible de contacter l'assistant. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void sendMessage(value);
  }

  async function handleConfirm(messageIndex: number, pendingAction: PendingAction) {
    if (!conversationId || loading) return;
    setLoading(true);
    try {
      const result = await confirmPendingActionAction(conversationId, pendingAction.functionName, pendingAction.args);
      setMessages((prev) => [
        ...prev.map((message, index) => (index === messageIndex ? { ...message, resolved: true } : message)),
        { role: "assistant", content: result.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel(messageIndex: number) {
    setMessages((prev) => [
      ...prev.map((message, index) => (index === messageIndex ? { ...message, resolved: true } : message)),
      { role: "assistant", content: "Annulé." },
    ]);
  }

  const isEmpty = messages.length === 0;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-6",
        isEmpty ? "min-h-[70vh] items-center justify-center text-center" : "py-6",
      )}
    >
      {isEmpty && (
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Bonjour{firstName ? ` ${firstName}` : ""}
          </h1>
          <p className="text-lg text-muted-foreground">Que recherchez-vous aujourd&apos;hui ?</p>
        </div>
      )}

      {!isEmpty && (
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex flex-col gap-2", message.role === "user" ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                  message.role === "user" ? "bg-secondary text-foreground" : "bg-card text-foreground",
                )}
              >
                {message.content}
              </div>

              {message.players && message.players.length > 0 && (
                <div className="flex w-full flex-col gap-2">
                  {message.players.map((player) => (
                    <PlayerCard key={player.id} player={player} score={player.score} />
                  ))}
                </div>
              )}

              {message.pendingAction && !message.resolved && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void handleConfirm(index, message.pendingAction!)} disabled={loading}>
                    Confirmer
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleCancel(index)} disabled={loading}>
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          ))}

          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      <div className="w-full">
        <Card className="flex flex-row items-center gap-2 p-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Je cherche un défenseur central de moins de 23 ans, rapide, bon dans les duels..."
            className="h-11 border-none bg-transparent shadow-none focus-visible:ring-0"
            disabled={loading}
          />
          <Button
            type="button"
            size="icon"
            disabled={loading || value.trim().length === 0}
            onClick={() => void sendMessage(value)}
          >
            <ArrowUp className="size-4" />
          </Button>
        </Card>
      </div>

      {isEmpty && (
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setValue(example)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
