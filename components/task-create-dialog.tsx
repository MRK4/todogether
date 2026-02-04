"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import type { TaskPriority } from "@/components/task-card";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: {
    title: string;
    description: string;
    author: string;
    priority: TaskPriority;
  }) => void;
};

export function TaskCreateDialog({
  open,
  onOpenChange,
  onCreate,
}: TaskCreateDialogProps) {
  const t = useTranslations("Task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAuthor("");
    setPriority("medium");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onCreate?.({
      title,
      description,
      author,
      priority,
    });
    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-2" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label
              htmlFor="task-title"
              className="text-sm font-medium leading-none"
            >
              {t("titleLabel")}
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="task-author"
              className="text-sm font-medium leading-none"
            >
              {t("authorLabel")}
            </label>
            <Input
              id="task-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <span className="text-sm font-medium leading-none">
              {t("priority")}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "low"
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30"
                }`}
                onClick={() => setPriority("low")}
              >
                {t("priorityLow")}
              </button>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "medium"
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30"
                }`}
                onClick={() => setPriority("medium")}
              >
                {t("priorityMedium")}
              </button>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  priority === "high"
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30"
                }`}
                onClick={() => setPriority("high")}
              >
                {t("priorityHigh")}
              </button>
            </div>
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
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

