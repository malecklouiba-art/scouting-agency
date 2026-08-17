import {
  createModelContent,
  createPartFromFunctionCall,
  createPartFromFunctionResponse,
  createUserContent,
  type Content,
} from "@google/genai";
import { GEMINI_MODEL, genai } from "./client";
import { SYSTEM_INSTRUCTION } from "./prompts/system";
import { FUNCTION_DECLARATIONS, SCOUTPRO_FUNCTIONS } from "./functions";
import type { FunctionContext } from "./functions/types";

export interface PendingAction {
  functionName: string;
  args: Record<string, unknown>;
}

export interface ChatTurnResult {
  reply: string;
  pendingAction?: PendingAction;
  functionCalled?: string;
  data?: unknown;
}

const PENDING_ACTION_PROMPTS: Record<string, string> = {
  add_to_shortlist: "Ajouter ce joueur à ta shortlist ?",
  remove_from_shortlist: "Retirer ce joueur de ta shortlist ?",
  create_report: "Créer ce rapport de scouting ?",
};

function describePendingAction(functionName: string): string {
  return PENDING_ACTION_PROMPTS[functionName] ?? `Confirmer l'action "${functionName}" ?`;
}

/**
 * Un tour de conversation : appelle Gemini, exécute immédiatement les
 * fonctions en lecture seule et reformule leur résultat, mais s'arrête avant
 * toute mutation — celle-ci remonte comme pendingAction, exécutée seulement
 * après confirmation explicite (voir src/server/actions/chat.actions.ts).
 */
export async function runChatTurn(history: Content[], ctx: FunctionContext): Promise<ChatTurnResult> {
  const response = await genai.models.generateContent({
    model: GEMINI_MODEL,
    contents: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
    },
  });

  const call = response.functionCalls?.[0];
  if (!call?.name) {
    return { reply: response.text ?? "" };
  }

  const fn = SCOUTPRO_FUNCTIONS[call.name];
  if (!fn) {
    return { reply: "Je n'ai pas pu traiter cette demande — fonction inconnue." };
  }

  const args = call.args ?? {};

  if (fn.isMutation) {
    return {
      reply: describePendingAction(call.name),
      pendingAction: { functionName: call.name, args },
    };
  }

  const result = await fn.execute(args, ctx);

  // Gemini's "thinking" models attach a thoughtSignature to their own
  // functionCall Part and require it echoed back verbatim on the next turn.
  // response.functionCalls is a convenience getter that strips it, and
  // createPartFromFunctionCall rebuilds a fresh Part with no way to set it —
  // so pull the original Part (with its signature) straight off the candidate
  // instead of reconstructing one, or Gemini rejects the follow-up call.
  const functionCallPart = response.candidates?.[0]?.content?.parts?.find((part) => part.functionCall);

  const followUp = await genai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      ...history,
      createModelContent(functionCallPart ?? createPartFromFunctionCall(call.name, args)),
      createUserContent(createPartFromFunctionResponse(call.id ?? call.name, call.name, { result })),
    ],
    config: { systemInstruction: SYSTEM_INSTRUCTION },
  });

  return { reply: followUp.text ?? "", functionCalled: call.name, data: result };
}
