import { revalidatePath } from "next/cache";

import type { Task as TaskCardTask } from "@/components/task-card";
import { prisma } from "@/lib/prisma";

export type BoardListItem = {
  id: string;
  title: string;
  description: string | null;
};

export type ColumnWithTasks = {
  id: string;
  title: string;
  order: number;
  color: string | null;
  tasks: TaskCardTask[];
};

export type BoardWithColumnsAndTasks = {
  id: string;
  title: string;
  description: string | null;
  locked: boolean;
  columns: ColumnWithTasks[];
};

function mapDbTaskToCardTask(
  t: {
    id: string;
    title: string;
    description: string | null;
    priority: string | null;
    createdAt: Date;
    updatedAt: Date;
    assigneeId: string | null;
    assignee: { name: string | null } | null;
  }
): TaskCardTask {
  const assigneeName = t.assignee?.name ?? "";
  const priority = t.priority as TaskCardTask["priority"];
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    priority:
      priority === "low" ||
      priority === "high" ||
      priority === "critical"
        ? priority
        : "medium",
    author: assigneeName,
    assignee: assigneeName || undefined,
    assigneeId: t.assigneeId ?? undefined,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function getBoards(): Promise<BoardListItem[]> {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, description: true },
  });
  return boards;
}

export async function getBoardsForUser(
  userId: string
): Promise<BoardListItem[]> {
  const boards = await prisma.board.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, description: true },
  });
  return boards;
}

export type CreateBoardResult =
  | { success: true; boardId: string }
  | { success: false; error: string };

export async function createBoard(
  userId: string,
  title: string
): Promise<CreateBoardResult> {
  const board = await prisma.board.create({
    data: {
      title,
      ownerId: userId,
    },
    select: { id: true },
  });
  revalidatePath("/");
  revalidatePath("/boards");
  return { success: true, boardId: board.id };
}

export type UpdateBoardResult =
  | { success: true }
  | { success: false; error: string };

export async function updateBoardTitle(
  boardId: string,
  title: string
): Promise<UpdateBoardResult> {
  if (!title.trim()) return { success: false, error: "Title required" };
  await prisma.board.update({
    where: { id: boardId },
    data: { title: title.trim() },
  });
  revalidatePath("/");
  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export async function updateBoardLocked(
  boardId: string,
  locked: boolean
): Promise<UpdateBoardResult> {
  await prisma.board.update({
    where: { id: boardId },
    data: { locked },
  });
  revalidatePath("/");
  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export type DeleteBoardResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteBoard(boardId: string): Promise<DeleteBoardResult> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true },
  });
  if (!board) return { success: false, error: "Board not found" };
  await prisma.board.delete({ where: { id: boardId } });
  revalidatePath("/");
  revalidatePath("/boards");
  return { success: true };
}

export async function getBoardWithColumnsAndTasks(
  boardId: string
): Promise<BoardWithColumnsAndTasks | null> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      title: true,
      description: true,
      locked: true,
      columns: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          color: true,
          tasks: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              priority: true,
              createdAt: true,
              updatedAt: true,
              assigneeId: true,
              assignee: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  if (!board) return null;

  return {
    id: board.id,
    title: board.title,
    description: board.description,
    locked: board.locked ?? false,
    columns: board.columns.map((col) => ({
      id: col.id,
      title: col.title,
      order: col.order,
      color: col.color,
      tasks: col.tasks.map(mapDbTaskToCardTask),
    })),
  };
}
