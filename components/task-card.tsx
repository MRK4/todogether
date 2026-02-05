"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  author: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
};

type TaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const t = useTranslations("Task");

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
    </Card>
  );
}
