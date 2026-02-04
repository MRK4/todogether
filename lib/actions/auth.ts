"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Au moins 8 caractères"),
    passwordConfirm: z.string(),
    name: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "passwordsMismatch",
    path: ["passwordConfirm"],
  });

export type SignUpState =
  | { success: true; message?: string }
  | { success: false; error: string; field?: string };

export async function signUp(_prev: SignUpState | null, formData: FormData): Promise<SignUpState> {
  const raw = {
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    passwordConfirm: formData.get("passwordConfirm") ?? "",
    name: formData.get("name") ?? undefined,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const key = Object.keys(first)[0] as keyof typeof first;
    const msg = Array.isArray(first[key]) ? first[key]?.[0] : first[key];
    return { success: false, error: String(msg ?? "Validation error"), field: key };
  }

  const { email, password, name } = parsed.data;
  const emailLower = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existing) {
    return { success: false, error: "emailAlreadyUsed", field: "email" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: emailLower,
      name: name || null,
      password: hashed,
    },
  });

  redirect("/login?registered=1");
}

export async function signInCredentials(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "invalidCredentials" };
  }
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw e;
  }
  return {};
}

export async function signInGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signInGitHub() {
  await signIn("github", { redirectTo: "/" });
}
