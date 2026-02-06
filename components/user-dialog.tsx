"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";

import { deleteAccount, type DeleteAccountResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

type UserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  user?: { name: string; email: string };
  onLogin?: () => void;
  onLogout?: () => void;
};

function clearGuestStorage() {
  if (typeof window === "undefined") return;
  localStorage.clear();
  document.cookie = `locale=; path=/; max-age=0`;
  document.cookie = `${SIDEBAR_COOKIE_NAME}=; path=/; max-age=0`;
}

export function UserDialog({
  open,
  onOpenChange,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
}: UserDialogProps) {
  const t = useTranslations("User");

  const handleLogin = () => {
    onLogin?.();
    onOpenChange(false);
  };

  const handleLogout = () => {
    onLogout?.();
    onOpenChange(false);
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    const result: DeleteAccountResult = await deleteAccount();
    setIsDeleting(false);
    setConfirmDeleteOpen(false);
    onOpenChange(false);
    if (result.success) {
      await signOut({ callbackUrl: "/" });
    }
  };

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearGuestData = () => {
    clearGuestStorage();
    onOpenChange(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>
            {isAuthenticated ? t("accountTitle") : t("loginTitle")}
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {t("guestDescription")}
            </p>
            <ul className="text-muted-foreground grid list-inside list-disc gap-1.5 text-sm">
              <li>{t("guestIncentive1")}</li>
              <li>{t("guestIncentive2")}</li>
              <li>{t("guestIncentive3")}</li>
              <li>{t("guestIncentive4")}</li>
            </ul>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground font-medium font-mono">
                  {t("name")}
                </dt>
                <dd>{user?.name}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground font-medium font-mono">
                  {t("email")}
                </dt>
                <dd>{user?.email}</dd>
              </div>
            </dl>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {!isAuthenticated ? (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setConfirmClearOpen(true)}
              >
                {t("clearGuestData")}
              </Button>
              <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("clearGuestDataConfirmTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("clearGuestDataConfirmDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleClearGuestData}
                    >
                      {t("clearGuestDataConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleLogin}>{t("loginCta")}</Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDeleting}
              >
                {t("deleteAccount")}
              </Button>
              <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("deleteAccountConfirmTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteAccountConfirmDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      {t("cancel")}
                    </AlertDialogCancel>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={handleConfirmDeleteAccount}
                    >
                      {isDeleting ? t("deleting") : t("deleteAccountConfirm")}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="default" onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
