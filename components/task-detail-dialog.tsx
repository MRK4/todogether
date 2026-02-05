"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Task, TaskPriority } from "@/components/task-card";
import { Button } from "@/components/ui/button";
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
}: TaskDetailDialogProps) {
  const t = useTranslations("Task");
  const locale = useLocale();

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>{t("detailTitle")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <p className="text-sm font-medium">{task.title.trim() || t("noTitle")}</p>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
