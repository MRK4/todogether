"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import type { Task, TaskPriority } from "@/components/task-card";
import {
  deleteTask,
  getUsers,
  updateTask,
  type UpdateTaskResult,
  type UserOption,
} from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  isBoardLocked?: boolean;
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

function getPriorityClasses(priority: TaskPriority): string {
  switch (priority) {
    case "low":
      return "border-emerald-500 bg-emerald-500/10 text-emerald-700";
    case "high":
      return "border-orange-500 bg-orange-500/10 text-orange-700";
    case "critical":
      return "border-red-600 bg-red-600/10 text-red-700";
    case "medium":
    default:
      return "border-amber-500 bg-amber-500/10 text-amber-700";
  }
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  isBoardLocked = false,
}: TaskDetailDialogProps) {
  const t = useTranslations("Task");
  const locale = useLocale();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idTooltipOpen, setIdTooltipOpen] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    if (!open || !task) {
      setIsEditing(false);
      setDeleteConfirmOpen(false);
      setIdTooltipOpen(false);
    }
  }, [open, task]);

  useEffect(() => {
    if (open && task) setPriority(task.priority);
  }, [open, task]);

  useEffect(() => {
    if (open && isEditing) {
      getUsers().then(setUsers);
    }
  }, [open, isEditing]);

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
  const lastHandledSuccessRef = useRef<UpdateTaskResult | null>(null);

  useEffect(() => {
    if (state?.success && state !== lastHandledSuccessRef.current) {
      lastHandledSuccessRef.current = state;
      toast.success(t("updateSuccess"));
      onTaskUpdated?.();
      onOpenChange(false);
      setIsEditing(false);
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, onTaskUpdated, onOpenChange, t]);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("edit") : (task.title.trim() || t("noTitle"))}
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
                htmlFor="task-edit-assignee"
                className="text-sm font-medium leading-none"
              >
                {t("assignee")}
              </label>
              <NativeSelect
                id="task-edit-assignee"
                name="assigneeId"
                defaultValue={task.assigneeId ?? ""}
                disabled={isPending}
                className="w-full"
              >
                <NativeSelectOption value="">
                  {t("assigneeNone")}
                </NativeSelectOption>
                {users.map((u) => (
                  <NativeSelectOption key={u.id} value={u.id}>
                    {u.name?.trim() || u.email}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
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
            <div className="grid gap-4 py-2 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium font-mono">
                    {t("description")}
                  </span>
                  <p className="whitespace-pre-wrap text-sm">
                    {task.description?.trim() || t("noDescription")}
                  </p>
                </div>
              </div>
              <dl className="grid shrink-0 gap-3 text-sm sm:min-w-[180px]">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground font-medium font-mono">
                    {t("priority")}
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getPriorityClasses(
                        task.priority
                      )}`}
                    >
                      {t(priorityKey(task.priority))}
                    </span>
                  </dd>
                </div>
                {session?.user && (
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground font-medium font-mono">
                      {t("author")}
                    </dt>
                    <dd>
                      {task.assigneeId === session.user.id
                        ? t("me")
                        : task.author || "—"}
                    </dd>
                  </div>
                )}
                {session?.user && task.assignee && (
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
                    {formatDate(task.createdAt, locale)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground font-medium font-mono">
                    {t("updatedAt")}
                  </dt>
                  <dd className="text-muted-foreground">
                    {formatDate(task.updatedAt, locale)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground font-medium font-mono">
                    {t("id")}
                  </dt>
                  <dd>
                    <Tooltip
                      open={idTooltipOpen}
                      onOpenChange={(open) => {
                        if (!open) setIdTooltipOpen(false);
                      }}
                    >
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(task.id);
                            toast.success(t("copied"));
                          }}
                          onMouseEnter={() => setIdTooltipOpen(true)}
                          onMouseLeave={() => setIdTooltipOpen(false)}
                          className="cursor-pointer rounded text-left font-mono text-xs text-muted-foreground underline-offset-2 hover:underline"
                        >
                          {task.id}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={4}>
                        {t("clickToCopy")}
                      </TooltipContent>
                    </Tooltip>
                  </dd>
                </div>
              </dl>
            </div>
            <DialogFooter>
              {!isBoardLocked && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={isDeleting}
                        aria-label={t("delete")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("delete")}</TooltipContent>
                  </Tooltip>
                  <Button onClick={() => setIsEditing(true)}>{t("edit")}</Button>
                </>
              )}
              {isBoardLocked && (
                <Button onClick={() => onOpenChange(false)}>{t("close")}</Button>
              )}
            </DialogFooter>
            <AlertDialog
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("deleteConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteConfirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={async () => {
                      if (!task) return;
                      setIsDeleting(true);
                      const result = await deleteTask(task.id);
                      setIsDeleting(false);
                      setDeleteConfirmOpen(false);
                      onOpenChange(false);
                      if (result.success) {
                        onTaskUpdated?.();
                        toast.success(t("deleteSuccess"));
                      } else {
                        toast.error(result.error);
                      }
                    }}
                  >
                    {isDeleting ? t("deleting") : t("deleteConfirm")}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
