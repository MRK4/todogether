"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  user?: { name: string; email: string };
  onLogin?: () => void;
  onLogout?: () => void;
};

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>
            {isAuthenticated ? t("accountTitle") : t("loginTitle")}
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              {t("guestDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                {t("currentUser")}
              </p>
            </div>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
          {!isAuthenticated ? (
            <Button onClick={handleLogin}>
              {t("loginCta")}
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleLogout}>
              {t("logout")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
