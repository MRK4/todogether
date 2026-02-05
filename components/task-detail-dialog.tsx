"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Task, TaskPriority } from "@/components/task-card";
import { updateTask, type UpdateTaskResult } from "@/lib/actions/tasks";
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

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
};

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function priorityKey(
  priority: TaskPriority
): "priorityLow" | "priorityMedium" | "priorityHigh" | "priorityCritical" {
  switch (priority) {
    case "low":
      return "priorityLow";
    case "critical":
      return "priorityCritical";
    case "high":
      return "priorityHigh";
    default:
      return "priorityMedium";
  }
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: TaskDetailDialogProps) {
  const t = useTranslations("Task");
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!open || !task) setIsEditing(false);
  }, [open, task]);

  const boundUpdateTask = (
    prev: UpdateTaskResult | null,
    formData: FormData
  ) => {
    if (!task) return Promise.resolve({ success: false, error: "No task" });
    return updateTask(task.id, prev, formData);
  };

  const [state, formAction, isPending] = useActionState<
    UpdateTaskResult | null,
    FormData
  >(boundUpdateTask, null);

  useEffect(() => {
    if (state?.success) {
      onTaskUpdated?.();
      onOpenChange(false);
      setIsEditing(false);
    }
  }, [state, onTaskUpdated, onOpenChange]);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("edit") : t("detailTitle")}
          </DialogTitle>
        </DialogHeader>
        {isEditing ? (
          <form className="grid gap-4 py-2" action={formAction}>
            <div className="grid gap-1">
              <label
                htmlFor="task-edit-title"
                className="text-sm font-medium leading-none"
              >
                {t("titleLabel")}
              </label>
              <Input
                id="task-edit-title"
                name="title"
                defaultValue={task.title.trim() || ""}
                required
                disabled={isPending}
              />
            </div>
            <div className="grid gap-1">
              <label
                htmlFor="task-edit-description"
                className="text-sm font-medium leading-none"
              >
                {t("description")}
              </label>
              <Textarea
                id="task-edit-description"
                name="description"
                rows={4}
                defaultValue={task.description?.trim() || ""}
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
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="grid gap-4 py-2">
              <div>
                <p className="text-sm font-medium">
                  {task.title.trim() || t("noTitle")}
                </p>
              </div>
              <dl className="grid gap-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground font-medium font-mono">
                    {t("priority")}
                  </dt>
                  <dd>{t(priorityKey(task.priority))}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground text-xs font-medium font-mono uppercase tracking-wide">
                    {t("description")}
                  </dt>
                  <dd className="whitespace-pre-wrap">
                    {task.description?.trim() || t("noDescription")}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground font-medium font-mono">
                    {t("author")}
                  </dt>
                  <dd>{task.author}</dd>
                </div>
                {task.assignee && (
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground font-medium font-mono">
                      {t("assignee")}
                    </dt>
                    <dd>{task.assignee}</dd>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground font-medium font-mono">
                    {t("createdAt")}
                  </dt>
                  <dd className="text-muted-foreground">
                    {formatDate(task.createdAt, locale)}{" "}
                    <span className="text-xs">
                      • {t("updatedAt")} {formatDate(task.updatedAt, locale)}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("close")}
              </Button>
              <Button onClick={() => setIsEditing(true)}>{t("edit")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
