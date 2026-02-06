"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock, LockOpen, Palette, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { BoardWithColumnsAndTasks, ColumnWithTasks } from "@/lib/boards";
import {
  updateBoardTitle,
  updateBoardLocked,
  deleteBoard,
} from "@/lib/actions/boards";
import { updateColumn } from "@/lib/actions/columns";
import { moveTask } from "@/lib/actions/tasks";
import { darkenHex } from "@/lib/utils";
import { ColumnCreateDialog } from "@/components/column-create-dialog";
import { ColumnEditDialog } from "@/components/column-edit-dialog";
import { DraggableTaskCard } from "@/components/draggable-task-card";
import { DroppableColumn } from "@/components/droppable-column";
import { type Task } from "@/components/task-card";
import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { TaskCreateDialog } from "@/components/task-create-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

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
  const [columnIdForNewTask, setColumnIdForNewTask] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editColumnTitleValue, setEditColumnTitleValue] = useState("");
  const [deleteBoardConfirmOpen, setDeleteBoardConfirmOpen] = useState(false);
  const [isUpdatingBoard, setIsUpdatingBoard] = useState(false);
  const [isUpdatingColumn, setIsUpdatingColumn] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const columnTitleInputRef = useRef<HTMLInputElement>(null);

  const columns = board?.columns ?? [];

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (editingColumnId && columnTitleInputRef.current) {
      columnTitleInputRef.current.focus();
      columnTitleInputRef.current.select();
    }
  }, [editingColumnId]);

  useEffect(() => {
    if (board?.title != null) setEditTitleValue(board.title);
  }, [board?.title]);

  async function handleSaveTitle() {
    if (!boardId || !editTitleValue.trim() || editTitleValue.trim() === board?.title) {
      setIsEditingTitle(false);
      return;
    }
    setIsUpdatingBoard(true);
    const result = await updateBoardTitle(boardId, editTitleValue.trim());
    setIsUpdatingBoard(false);
    setIsEditingTitle(false);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  async function handleSaveColumnTitle(column: ColumnWithTasks) {
    const trimmed = editColumnTitleValue.trim();
    if (!trimmed || trimmed === column.title) {
      setEditingColumnId(null);
      return;
    }
    setIsUpdatingColumn(true);
    const formData = new FormData();
    formData.set("title", trimmed);
    formData.set("color", column.color ?? "");
    const result = await updateColumn(column.id, null, formData);
    setIsUpdatingColumn(false);
    setEditingColumnId(null);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  async function handleToggleLock() {
    if (!boardId || board?.locked == null) return;
    setIsUpdatingBoard(true);
    const result = await updateBoardLocked(boardId, !board.locked);
    setIsUpdatingBoard(false);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  async function handleDeleteBoard() {
    if (!boardId) return;
    setIsUpdatingBoard(true);
    const result = await deleteBoard(boardId);
    setIsUpdatingBoard(false);
    setDeleteBoardConfirmOpen(false);
    if (result.success) {
      router.push("/boards");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    if (board?.locked) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const taskId = String(active.id);
    const targetColumnId = String(over.id);
    const sourceColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    );
    if (!sourceColumn || sourceColumn.id === targetColumnId) return;
    const result = await moveTask(taskId, targetColumnId);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {boardId && board && (
        <header className="bg-background/95 sticky top-0 z-10 -mx-6 -mt-6 flex h-12 shrink-0 items-center gap-3 border-b px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setEditTitleValue(board.title);
                    setIsEditingTitle(false);
                  }
                }}
                placeholder={tBoard("boardTitlePlaceholder")}
                className="h-8 max-w-[280px] font-medium"
                disabled={isUpdatingBoard}
              />
            ) : (
              <button
                type="button"
                onClick={() => !board.locked && setIsEditingTitle(true)}
                disabled={board.locked}
                className="text-foreground hover:bg-muted/80 group -mx-1 flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-left font-medium transition-colors disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent"
              >
                <span className="truncate max-w-[260px]">
                  {board.title || tBoard("boardTitlePlaceholder")}
                </span>
                {!board.locked && (
                  <Pencil className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                )}
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleToggleLock}
                  disabled={isUpdatingBoard}
                  aria-label={board.locked ? tBoard("unlock") : tBoard("lock")}
                >
                  {board.locked ? (
                    <Lock className="size-4" />
                  ) : (
                    <LockOpen className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {board.locked ? tBoard("unlock") : tBoard("lock")}
              </TooltipContent>
            </Tooltip>
            {!board.locked && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={() => setDeleteBoardConfirmOpen(true)}
                    disabled={isUpdatingBoard}
                    aria-label={tBoard("deleteBoard")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{tBoard("deleteBoard")}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>
      )}

      <AlertDialog open={deleteBoardConfirmOpen} onOpenChange={setDeleteBoardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tBoard("deleteBoardConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tBoard("deleteBoardConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingBoard}>{tTask("cancel")}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isUpdatingBoard}
              onClick={handleDeleteBoard}
            >
              {tBoard("deleteBoardConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
                <CardTitle className="min-w-0 flex-1 text-sm font-semibold">
                  {editingColumnId === column.id ? (
                    <Input
                      ref={columnTitleInputRef}
                      value={editColumnTitleValue}
                      onChange={(e) => setEditColumnTitleValue(e.target.value)}
                      onBlur={() => handleSaveColumnTitle(column)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveColumnTitle(column);
                        if (e.key === "Escape") {
                          setEditColumnTitleValue(column.title);
                          setEditingColumnId(null);
                        }
                      }}
                      placeholder={tBoard("columnTitleLabel")}
                      className="h-7 font-mono text-sm font-semibold"
                      disabled={isUpdatingColumn}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        !board?.locked &&
                        (setEditingColumnId(column.id), setEditColumnTitleValue(column.title))
                      }
                      disabled={board?.locked}
                      className="column-title-button text-foreground hover:bg-muted/80 group -mx-1 flex w-fit min-w-0 cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-left font-medium transition-colors disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent"
                    >
                      <span className="truncate">{column.title}</span>
                      {!board?.locked && (
                        <Pencil className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                      )}
                    </button>
                  )}
                </CardTitle>
                {!board?.locked && (
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="shrink-0"
                    aria-label={tBoard("columnColorLabel")}
                    onClick={() => setColumnToEdit(column)}
                  >
                    <Palette className="h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <DroppableColumn
                  id={column.id}
                  taskListContent={
                    column.tasks.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {column.tasks.map((task) => (
                          <DraggableTaskCard
                            key={task.id}
                            task={task}
                            onClick={setSelectedTask}
                            disabled={board?.locked}
                          />
                        ))}
                      </div>
                    ) : null
                  }
                  addTaskButton={
                    board?.locked ? null : (
                      <button
                        type="button"
                        className="cursor-pointer border-dashed text-muted-foreground hover:bg-muted/60 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors"
                        onClick={() => {
                          setColumnIdForNewTask(column.id);
                          setIsCreateOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>{tTask("addTask")}</span>
                      </button>
                    )
                  }
                />
              </CardContent>
            </Card>
          ))}

          {boardId && !board?.locked ? (
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
      </DndContext>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onTaskUpdated={() => router.refresh()}
        isBoardLocked={board?.locked ?? false}
      />
      {boardId && columnIdForNewTask && (
        <TaskCreateDialog
          boardId={boardId}
          columnId={columnIdForNewTask}
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setColumnIdForNewTask(null);
            } else {
              setIsCreateOpen(true);
            }
          }}
        />
      )}
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
