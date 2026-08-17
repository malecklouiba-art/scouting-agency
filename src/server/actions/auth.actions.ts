"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/server/supabase/server";
import { prisma } from "@/server/db/prisma";

export type AuthActionState = {
  status: "error" | "notice";
  message: string;
} | null;

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return {
      status: "error",
      message:
        error?.message === "User already registered"
          ? "Un compte existe déjà avec cet email."
          : "Impossible de créer le compte. Réessayez.",
    };
  }

  const supabaseUserId = data.user.id;

  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: `${firstName} ${lastName}`.trim() || email },
    });
    await tx.user.create({
      data: {
        supabaseUserId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        organizationId: organization.id,
        role: "OWNER",
      },
    });
  });

  if (!data.session) {
    return {
      status: "notice",
      message:
        "Compte créé. Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
