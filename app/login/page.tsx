"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { signInCredentials, signInGoogle, signInGitHub } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(signInCredentials, null as { error?: string } | null);
  const [pending, setPending] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-mono text-2xl font-semibold">{t("login")}</h1>
        </div>

        <form
          action={formAction}
          className="space-y-4"
          onSubmit={() => setPending(true)}
        >
          {state?.error && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t(state.error)}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {t("signIn")}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("noAccount")}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <form action={signInGoogle}>
            <Button type="submit" variant="outline" className="w-full">
              {t("signInWithGoogle")}
            </Button>
          </form>
          <form action={signInGitHub}>
            <Button type="submit" variant="outline" className="w-full">
              {t("signInWithGitHub")}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/signup" className="underline underline-offset-2 hover:no-underline">
            {t("noAccount")} {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
