"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  author: string;
  assignee?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};

type TaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

function getPriorityLabelKey(
  priority: TaskPriority
): "priorityLow" | "priorityMedium" | "priorityHigh" | "priorityCritical" {
  switch (priority) {
    case "low":
      return "priorityLow";
    case "high":
      return "priorityHigh";
    case "critical":
      return "priorityCritical";
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

function getDisplayName(task: Task): string {
  return task.assignee?.trim() || task.author?.trim() || "";
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || first.toUpperCase() || "?";
}

export function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const t = useTranslations("Task");
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const rawDisplayName = getDisplayName(task);
  const displayName = rawDisplayName || (!isAuthenticated ? t("me") : "");
  const initials = getInitials(displayName);
  const priorityLabelKey = getPriorityLabelKey(task.priority);

  return (
    <Card
      className="group cursor-pointer gap-2 transition-shadow hover:shadow-md"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(task) : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(task);
              }
            }
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 py-3 pb-1">
        <p className="line-clamp-2 text-sm font-medium font-mono leading-tight">
          {task.title.trim() || t("noTitle")}
        </p>
        <div
          className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={t("edit")}
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={t("delete")}
              onClick={() => onDelete(task)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      {task.description?.trim() && (
        <CardContent className="py-1">
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="flex items-center justify-between px-6 pt-1 pb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">
              {initials}
            </AvatarFallback>
          </Avatar>
          {displayName && (
            <span className="text-xs text-muted-foreground">
              {displayName}
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getPriorityClasses(
            task.priority
          )}`}
        >
          {t(priorityLabelKey)}
        </span>
      </CardFooter>
    </Card>
  );
}
