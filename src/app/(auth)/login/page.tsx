"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { signInAction } from "@/server/actions/auth.actions";

export default function LoginPage() {
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Accédez à votre espace de scouting ScoutPro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormMessage state={state} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@structure.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <SubmitButton>Se connecter</SubmitButton>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground">
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
