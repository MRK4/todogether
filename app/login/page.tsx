"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { signInCredentials, signInGoogle, signInGitHub } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(
    signInCredentials,
    null as { error?: string } | null
  );
  const [pending, setPending] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="font-mono text-3xl font-semibold tracking-tight">
            {t("login")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("loginSubtitle")}</p>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xl">
              {t("signIn")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={formAction}
              className="space-y-4"
              onSubmit={() => setPending(true)}
            >
              {state?.error && (
                <p
                  className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
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
                  placeholder={t("emailPlaceholder")}
                  className="h-10"
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
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                className="h-10 w-full font-medium"
                disabled={pending}
              >
                {t("signIn")}
              </Button>
            </form>

            <div className="flex items-center gap-4 py-2">
              <Separator className="flex-1" />
              <span className="text-muted-foreground shrink-0 text-xs uppercase tracking-wider">
                {t("orContinueWith")}
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="grid gap-2">
              <form action={signInGoogle}>
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full font-medium"
                >
                  {t("signInWithGoogle")}
                </Button>
              </form>
              <form action={signInGitHub}>
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full font-medium"
                >
                  {t("signInWithGitHub")}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-muted-foreground text-sm">
              {t("noAccount")}{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
              >
                {t("signUp")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
