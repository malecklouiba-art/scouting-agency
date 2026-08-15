import { redirect } from "next/navigation";

export default function RootPage() {
  // Le proxy (src/proxy.ts) renvoie déjà les utilisateurs non connectés vers
  // /login avant que cette page ne s'exécute — n'être atteint ici que
  // signifie qu'une session valide existe.
  redirect("/dashboard");
}
