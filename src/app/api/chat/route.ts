import { createUserContent, type Content } from "@google/genai";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { runChatTurn } from "@/server/gemini/router";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "message requis" }, { status: 400 });
  }

  const conversationId = typeof body?.conversationId === "string" ? body.conversationId : undefined;
  const existingConversation = conversationId
    ? await prisma.conversation.findFirst({ where: { id: conversationId, userId: user.id } })
    : null;
  const conversation = existingConversation ?? (await prisma.conversation.create({ data: { userId: user.id } }));

  const priorMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  const history: Content[] = priorMessages.map((entry) => ({
    role: entry.role === "assistant" ? "model" : "user",
    parts: [{ text: entry.content }],
  }));
  history.push(createUserContent(message));

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  let result;
  try {
    result = await runChatTurn(history, { userId: user.id, organizationId: user.organizationId });
  } catch (error) {
    console.error("runChatTurn failed", error);
    result = { reply: "L'assistant IA est momentanément indisponible. Réessaie dans un instant." };
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: result.reply,
      // Round-trip JSON pour garantir la compatibilité avec la colonne Json de
      // Prisma (les args viennent de Gemini, typés Record<string, unknown>).
      functionCalls: result.pendingAction
        ? JSON.parse(JSON.stringify({ pendingAction: result.pendingAction }))
        : result.functionCalled
          ? { name: result.functionCalled }
          : undefined,
    },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    reply: result.reply,
    pendingAction: result.pendingAction ?? null,
    data: result.data ?? null,
  });
}
