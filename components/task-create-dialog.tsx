"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

import type { TaskPriority } from "@/components/task-card";
import { createTask, type CreateTaskState } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type CreateTaskLocalData = {
  title: string;
  description?: string | null;
  priority: string;
};

type TaskCreateDialogProps = {
  boardId: string;
  columnId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTaskLocal?: (
    data: CreateTaskLocalData
  ) => Promise<{ success: boolean; error?: string }>;
};

export function TaskCreateDialog({
  boardId,
  columnId,
  open,
  onOpenChange,
  onCreateTaskLocal,
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
      toast.success(t("createSuccess"));
      onOpenChange(false);
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, onOpenChange, t]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleLocalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onCreateTaskLocal || !columnId) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim() ?? "";
    const description = (formData.get("description") as string)?.trim() || undefined;
    const priority = (formData.get("priority") as string) ?? "medium";
    if (!title) {
      toast.error(t("titleLabel"));
      return;
    }
    const result = await onCreateTaskLocal({ title, description, priority });
    if (result.success) {
      toast.success(t("createSuccess"));
      onOpenChange(false);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const useLocalSubmit = !!onCreateTaskLocal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 py-2"
          action={useLocalSubmit ? undefined : formAction}
          onSubmit={useLocalSubmit ? handleLocalSubmit : undefined}
        >
          <div className="grid gap-1">
            <label
              htmlFor="task-title"
              className="font-mono text-sm font-medium leading-none"
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
              className="font-mono text-sm font-medium leading-none"
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
            <span className="font-mono text-sm font-medium leading-none">
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
              className="font-mono text-sm font-medium leading-none"
            >
              {t("description")}
            </label>
            <RichTextEditor
              id="task-description"
              name="description"
              placeholder={t("description")}
              disabled={isPending}
              minHeight="6rem"
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


