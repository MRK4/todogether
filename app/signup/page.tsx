"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Shuffle } from "lucide-react";

import {
  signUp,
  signInGoogle,
  signInGitHub,
  type SignUpState,
} from "@/lib/actions/auth";
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

const PSEUDONYM_ADJECTIVES = [
  "Swift",
  "Happy",
  "Calm",
  "Bold",
  "Bright",
  "Cosy",
  "Daring",
  "Eager",
  "Gentle",
  "Jolly",
  "Lucky",
  "Noble",
  "Quick",
  "Silent",
  "Wise",
];

const PSEUDONYM_NOUNS = [
  "Fox",
  "Rabbit",
  "Owl",
  "Bear",
  "Wolf",
  "Lynx",
  "Hawk",
  "Deer",
  "Panda",
  "Tiger",
  "Eagle",
  "Otter",
  "Crow",
  "Seal",
  "Dove",
];

function generateRandomPseudonym(): string {
  const adj = PSEUDONYM_ADJECTIVES[Math.floor(Math.random() * PSEUDONYM_ADJECTIVES.length)]!;
  const noun = PSEUDONYM_NOUNS[Math.floor(Math.random() * PSEUDONYM_NOUNS.length)]!;
  return `${adj}${noun}`;
}

export default function SignUpPage() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(signUp, null as SignUpState | null);
  const [pending, setPending] = useState(false);
  const [pseudonym, setPseudonym] = useState("");

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="font-mono text-3xl font-semibold tracking-tight">
            {t("signup")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("signupSubtitle")}
          </p>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xl">
              {t("signUp")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={formAction}
              className="space-y-4"
              onSubmit={() => setPending(true)}
            >
              {state && !state.success && state.error && (
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
                <Label htmlFor="name">{t("pseudonym")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="username"
                    placeholder={t("pseudonymPlaceholder")}
                    className="h-10 flex-1"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 shrink-0"
                    onClick={() => setPseudonym(generateRandomPseudonym())}
                    title={t("generatePseudonym")}
                    aria-label={t("generatePseudonym")}
                  >
                    <Shuffle className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">
                  {t("passwordConfirm")}
                </Label>
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                className="h-10 w-full font-medium"
                disabled={pending}
              >
                {t("signUp")}
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
              {t("hasAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
              >
                {t("signIn")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
