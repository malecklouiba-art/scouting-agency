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
import { signUpAction } from "@/server/actions/auth.actions";

export default function RegisterPage() {
  const [state, formAction] = useActionState(signUpAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Quelques informations pour démarrer avec ScoutPro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FormMessage state={state} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" name="firstName" placeholder="Alex" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" placeholder="Martin" />
            </div>
          </div>
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
              minLength={6}
            />
          </div>
          <SubmitButton>Créer mon compte</SubmitButton>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
