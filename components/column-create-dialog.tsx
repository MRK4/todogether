"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { createColumn, type CreateColumnState } from "@/lib/actions/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PRESET_COLORS = [
  "#ffffff", // pure white
  "#fef3c7", // amber-100
  "#dbeafe", // blue-100
  "#d1fae5", // emerald-100
  "#fce7f3", // pink-100
  "#e9d5ff", // violet-100
  "#e0e7ff", // indigo-100
  "#f3e8ff", // purple-100
  "#fef9c3", // yellow-100
];

type ColumnCreateDialogProps = {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function ColumnCreateDialog(props: ColumnCreateDialogProps) {
  const { boardId, open, onOpenChange, onSuccess } = props;
  const t = useTranslations("Board");
  const tTask = useTranslations("Task");
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]!);

  const boundCreateColumn = (prev: CreateColumnState | null, formData: FormData) =>
    createColumn(boardId, prev, formData);

  const [state, formAction, isPending] = useActionState(boundCreateColumn, null);
  const lastHandledColumnIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (state?.success && state.columnId !== lastHandledColumnIdRef.current) {
      lastHandledColumnIdRef.current = state.columnId;
      onOpenChange(false);
      onSuccess?.();
    }
  }, [state, onOpenChange, onSuccess]);

  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createColumnTitle")}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-2" action={formAction}>
          <div className="grid gap-2">
            <Label htmlFor="column-title">{t("columnTitleLabel")}</Label>
            <Input
              id="column-title"
              name="title"
              placeholder={t("columnTitleLabel")}
              required
              autoFocus
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("columnColorLabel")}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  className="cursor-pointer h-8 w-8 shrink-0 rounded-md border-2 border-muted-foreground/30 transition-all duration-50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{
                    backgroundColor: hex,
                    borderColor: selectedColor === hex ? "var(--primary)" : undefined,
                  }}
                  onClick={() => setSelectedColor(hex)}
                />
              ))}
              <label
                htmlFor="column-color-custom"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/50 hover:border-muted-foreground"
              >
                <input
                  id="column-color-custom"
                  type="color"
                  className="sr-only"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
                <span className="text-muted-foreground text-xs">+</span>
              </label>
            </div>
            <input type="hidden" name="color" value={selectedColor} />
          </div>
          {state && !state.success && (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              {tTask("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("addColumn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
