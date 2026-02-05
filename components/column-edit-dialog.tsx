"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { updateColumn, type UpdateColumnState } from "@/lib/actions/columns";
import type { ColumnWithTasks } from "@/lib/boards";
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
import { toast } from "sonner";

const PRESET_COLORS = [
  "#ffffff",
  "#fef3c7",
  "#dbeafe",
  "#d1fae5",
  "#fce7f3",
  "#e9d5ff",
  "#e0e7ff",
  "#f3e8ff",
  "#fef9c3",
];

type ColumnEditDialogProps = {
  column: ColumnWithTasks | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function ColumnEditDialog(props: ColumnEditDialogProps) {
  const { column, open, onOpenChange, onSuccess } = props;
  const t = useTranslations("Board");
  const tTask = useTranslations("Task");
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]!);

  const boundUpdateColumn = (prev: UpdateColumnState | null, formData: FormData) =>
    column ? updateColumn(column.id, prev, formData) : Promise.resolve({ success: false, error: "No column" });

  const [state, formAction, isPending] = useActionState(boundUpdateColumn, null);
  const hasHandledSuccessRef = useRef(false);

  useEffect(() => {
    if (open && column) {
      setTitle(column.title);
      setSelectedColor(column.color ?? PRESET_COLORS[0]!);
      hasHandledSuccessRef.current = false;
    }
  }, [open, column]);

  useEffect(() => {
    if (state?.success && !hasHandledSuccessRef.current) {
      hasHandledSuccessRef.current = true;
      toast.success(t("columnUpdateSuccess"));
      onOpenChange(false);
      onSuccess?.();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, onOpenChange, onSuccess, t]);

  const handleCancel = () => onOpenChange(false);

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editColumnTitle")}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-2" action={formAction}>
          <div className="grid gap-2">
            <Label htmlFor="column-edit-title">{t("columnTitleLabel")}</Label>
            <Input
              id="column-edit-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                htmlFor="column-edit-color-custom"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/50 hover:border-muted-foreground"
              >
                <input
                  id="column-edit-color-custom"
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
              {t("saveColumn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
