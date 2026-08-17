import type { FunctionDeclaration } from "@google/genai";

export interface FunctionContext {
  userId: string;
  organizationId: string;
}

export interface ScoutProFunction {
  declaration: FunctionDeclaration;
  /**
   * Les fonctions de mutation ne s'exécutent jamais directement depuis un
   * appel du modèle — le router (Étape 10) construit une action à confirmer
   * et n'appelle `execute` qu'après confirmation explicite de l'utilisateur.
   */
  isMutation: boolean;
  execute: (args: Record<string, unknown>, ctx: FunctionContext) => Promise<unknown>;
}
