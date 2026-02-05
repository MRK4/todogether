"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createTaskSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type CreateTaskState =
  | { success: true; taskId: string }
  | { success: false; error: string; field?: string };

export async function createTask(
  boardId: string,
  columnId: string,
  _prev: CreateTaskState | null,
  formData: FormData
): Promise<CreateTaskState> {
  const raw = {
    title: formData.get("title") ?? "",
    description: (formData.get("description") as string) ?? "",
    priority: (formData.get("priority") as string) ?? "medium",
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const key = Object.keys(first)[0] as keyof typeof first;
    const msg = Array.isArray(first[key]) ? first[key]?.[0] : first[key];
    return {
      success: false,
      error: String(msg ?? "Validation error"),
      field: key,
    };
  }

  // Vérifier que la colonne appartient bien au board
  const column = await prisma.column.findFirst({
    where: { id: columnId, boardId },
    select: { id: true, boardId: true },
  });
  if (!column) {
    return { success: false, error: "Column not found" };
  }

  // Calculer l'ordre dans la colonne
  const max = await prisma.task.aggregate({
    where: { columnId },
    _max: { order: true },
  });
  const order = (max._max.order ?? -1) + 1;

  // Récupérer l'utilisateur connecté (si présent)
  const session = await auth();
  const assigneeId = session?.user?.id ?? null;

  const task = await prisma.task.create({
    data: {
      boardId,
      columnId,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      order,
      assigneeId,
    },
  });

  revalidatePath("/");
  revalidatePath(`/boards/${boardId}`);

  return { success: true, taskId: task.id };
}

export type MoveTaskResult =
  | { success: true }
  | { success: false; error: string };

export async function moveTask(
  taskId: string,
  targetColumnId: string
): Promise<MoveTaskResult> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, boardId: true, columnId: true },
  });
  if (!task) {
    return { success: false, error: "Task not found" };
  }

  const targetColumn = await prisma.column.findFirst({
    where: { id: targetColumnId, boardId: task.boardId },
    select: { id: true },
  });
  if (!targetColumn) {
    return { success: false, error: "Target column not found" };
  }

  if (task.columnId === targetColumnId) {
    return { success: true };
  }

  const max = await prisma.task.aggregate({
    where: { columnId: targetColumnId },
    _max: { order: true },
  });
  const newOrder = (max._max.order ?? -1) + 1;

  await prisma.task.update({
    where: { id: taskId },
    data: { columnId: targetColumnId, order: newOrder },
  });

  revalidatePath("/");
  revalidatePath(`/boards/${task.boardId}`);

  return { success: true };
}

const updateTaskSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  description: z.string().max(2000).optional(),
});

export type UpdateTaskResult =
  | { success: true }
  | { success: false; error: string; field?: string };

export async function updateTask(
  taskId: string,
  _prev: UpdateTaskResult | null,
  formData: FormData
): Promise<UpdateTaskResult> {
  const raw = {
    title: formData.get("title") ?? "",
    description: (formData.get("description") as string) ?? "",
  };

  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const key = Object.keys(first)[0] as keyof typeof first;
    const msg = Array.isArray(first[key]) ? first[key]?.[0] : first[key];
    return {
      success: false,
      error: String(msg ?? "Validation error"),
      field: key,
    };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, boardId: true },
  });
  if (!task) {
    return { success: false, error: "Task not found" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
    },
  });

  revalidatePath("/");
  revalidatePath(`/boards/${task.boardId}`);

  return { success: true };
}

