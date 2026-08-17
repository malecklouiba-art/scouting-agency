import type { FunctionDeclaration } from "@google/genai";

export interface ScoutProFunction {
  declaration: FunctionDeclaration;
  /**
   * Les fonctions de mutation ne s'exécutent jamais directement depuis un
   * appel du modèle — elles remontent une action à confirmer explicitement
   * par l'utilisateur avant exécution (gating, Étape 10).
   */
  isMutation: boolean;
}
