"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Plus } from "lucide-react";

import type { BoardWithColumnsAndTasks, ColumnWithTasks } from "@/lib/boards";
import { darkenHex } from "@/lib/utils";
import { ColumnCreateDialog } from "@/components/column-create-dialog";
import { ColumnEditDialog } from "@/components/column-edit-dialog";
import { TaskCard, type Task } from "@/components/task-card";
import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { TaskCreateDialog } from "@/components/task-create-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type BoardViewProps = {
  boardId: string | null;
  board: BoardWithColumnsAndTasks | null;
};

export function BoardView({ boardId, board }: BoardViewProps) {
  const router = useRouter();
  const tBoard = useTranslations("Board");
  const tTask = useTranslations("Task");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState<ColumnWithTasks | null>(null);

  const columns = board?.columns ?? [];

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-stretch gap-4 pb-4">
        {columns.map((column) => (
          <Card
            key={column.id}
            className={column.color ? "column-colored flex min-h-[280px] min-w-[260px] max-w-xs flex-1 flex-col" : "flex min-h-[280px] min-w-[260px] max-w-xs flex-1 flex-col"}
            style={
              column.color
                ? {
                    backgroundColor: column.color,
                    borderColor: darkenHex(column.color, 0.75),
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    ["--column-hover" as string]: darkenHex(column.color, 0.88),
                    ["--column-hover-subtle" as string]: darkenHex(column.color, 0.95),
                  }
                : undefined
            }
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-sm font-semibold">
                {column.title}
              </CardTitle>
              <Button
                size="icon-xs"
                variant="ghost"
                className="shrink-0"
                aria-label={tBoard("editColumn")}
                onClick={() => setColumnToEdit(column)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              {column.tasks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={setSelectedTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="border-dashed bg-muted/40 text-muted-foreground flex flex-1 items-center justify-center rounded-lg border text-xs">
                  {tBoard("empty")}
                </div>
              )}
              <button
                type="button"
                className="cursor-pointer border-dashed text-muted-foreground hover:bg-muted/60 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-3 w-3" />
                <span>{tTask("addTask")}</span>
              </button>
            </CardContent>
          </Card>
        ))}

        {boardId ? (
          <button
            type="button"
            className="border-dashed bg-muted/40 text-muted-foreground hover:bg-muted/60 flex min-h-[280px] min-w-[260px] max-w-xs flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border transition-colors"
            onClick={() => setIsCreateColumnOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">{tBoard("addColumn")}</span>
          </button>
        ) : null}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
      <TaskCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {boardId ? (
        <ColumnCreateDialog
          boardId={boardId}
          open={isCreateColumnOpen}
          onOpenChange={setIsCreateColumnOpen}
          onSuccess={() => router.refresh()}
        />
      ) : null}
      <ColumnEditDialog
        column={columnToEdit}
        open={!!columnToEdit}
        onOpenChange={(open) => !open && setColumnToEdit(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
