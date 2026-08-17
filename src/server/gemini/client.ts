import { GoogleGenAI } from "@google/genai";

declare global {
  var __genai: GoogleGenAI | undefined;
}

function createClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export const genai = globalThis.__genai ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__genai = genai;
}

// gemini-3.6-flash : modèle "stable" le moins cher orienté planification
// agentique (function calling) — voir GEMINI_MODEL pour changer sans
// toucher au code (ex: repli sur gemini-2.5-flash).
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
