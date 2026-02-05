"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

import type { TaskPriority } from "@/components/task-card";
import { createTask, type CreateTaskState } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TaskCreateDialogProps = {
  boardId: string;
  columnId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskCreateDialog({
  boardId,
  columnId,
  open,
  onOpenChange,
}: TaskCreateDialogProps) {
  const t = useTranslations("Task");
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const assigneeLabel =
    (isAuthenticated
      ? session?.user?.name || session?.user?.email || "Moi"
      : "Moi") ?? "Moi";

  const [priority, setPriority] = useState<TaskPriority>("medium");

  const boundCreateTask = (
    prev: CreateTaskState | null,
    formData: FormData
  ) => {
    if (!columnId) {
      return Promise.resolve({
        success: false,
        error: "Column not found",
      } satisfies CreateTaskState);
    }
    return createTask(boardId, columnId, prev, formData);
  };

  const [state, formAction, isPending] = useActionState<
    CreateTaskState | null,
    FormData
  >(boundCreateTask, null);
  const lastHandledTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (state?.success && state.taskId !== lastHandledTaskIdRef.current) {
      lastHandledTaskIdRef.current = state.taskId;
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-2" action={formAction}>
          <div className="grid gap-1">
            <label
              htmlFor="task-title"
              className="text-sm font-medium leading-none"
            >
              {t("titleLabel")}
            </label>
            <Input
              id="task-title"
              name="title"
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="task-assignee"
              className="text-sm font-medium leading-none"
            >
              {t("assignee")}
            </label>
            <Input
              id="task-assignee"
              value={assigneeLabel}
              disabled
              readOnly
            />
          </div>

          <div className="grid gap-1">
            <span className="text-sm font-medium leading-none">
              {t("priority")}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "low"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
                onClick={() => setPriority("low")}
                disabled={isPending}
              >
                {t("priorityLow")}
              </button>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "medium"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
                onClick={() => setPriority("medium")}
                disabled={isPending}
              >
                {t("priorityMedium")}
              </button>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "high"
                    ? "border-orange-500 bg-orange-500/10 text-orange-700"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
                onClick={() => setPriority("high")}
                disabled={isPending}
              >
                {t("priorityHigh")}
              </button>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "critical"
                    ? "border-red-600 bg-red-600/10 text-red-700"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
                onClick={() => setPriority("critical")}
                disabled={isPending}
              >
                {t("priorityCritical")}
              </button>
            </div>
            <input type="hidden" name="priority" value={priority} />
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="task-description"
              className="text-sm font-medium leading-none"
            >
              {t("description")}
            </label>
            <Textarea
              id="task-description"
              name="description"
              rows={4}
              disabled={isPending}
            />
          </div>

          {state && !state.success && (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


