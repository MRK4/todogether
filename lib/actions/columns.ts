"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createColumnSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  order: z.number().int().min(0).optional(),
  color: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal("")]).optional(),
});

export type CreateColumnState =
  | { success: true; columnId: string }
  | { success: false; error: string; field?: string };

export async function createColumn(
  boardId: string,
  _prev: CreateColumnState | null,
  formData: FormData
): Promise<CreateColumnState> {
  const raw = {
    title: formData.get("title") ?? "",
    order: formData.get("order") ? Number(formData.get("order")) : undefined,
    color: (formData.get("color") as string) ?? undefined,
  };

  const parsed = createColumnSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const key = Object.keys(first)[0] as keyof typeof first;
    const msg = Array.isArray(first[key]) ? first[key]?.[0] : first[key];
    return { success: false, error: String(msg ?? "Validation error"), field: key };
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true },
  });
  if (!board) {
    return { success: false, error: "Board not found" };
  }

  let order = parsed.data.order;
  if (order === undefined) {
    const max = await prisma.column.aggregate({
      where: { boardId },
      _max: { order: true },
    });
    order = (max._max.order ?? -1) + 1;
  }

  const color = parsed.data.color && parsed.data.color !== "" ? parsed.data.color : null;

  const column = await prisma.column.create({
    data: {
      boardId,
      title: parsed.data.title.trim(),
      order,
      color,
    },
  });

  revalidatePath("/");
  revalidatePath(`/boards/${boardId}`);
  return { success: true, columnId: column.id };
}

const updateColumnSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  color: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal("")]).optional(),
});

export type UpdateColumnState =
  | { success: true }
  | { success: false; error: string; field?: string };

export async function updateColumn(
  columnId: string,
  _prev: UpdateColumnState | null,
  formData: FormData
): Promise<UpdateColumnState> {
  const raw = {
    title: formData.get("title") ?? "",
    color: (formData.get("color") as string) ?? undefined,
  };

  const parsed = updateColumnSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const key = Object.keys(first)[0] as keyof typeof first;
    const msg = Array.isArray(first[key]) ? first[key]?.[0] : first[key];
    return { success: false, error: String(msg ?? "Validation error"), field: key };
  }

  const existing = await prisma.column.findUnique({
    where: { id: columnId },
    select: { id: true, boardId: true },
  });
  if (!existing) {
    return { success: false, error: "Column not found" };
  }

  const color = parsed.data.color && parsed.data.color !== "" ? parsed.data.color : null;

  await prisma.column.update({
    where: { id: columnId },
    data: {
      title: parsed.data.title.trim(),
      color,
    },
  });

  revalidatePath("/");
  revalidatePath(`/boards/${existing.boardId}`);
  return { success: true };
}

export async function getColumns(boardId: string) {
  return prisma.column.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true, color: true },
  });
}
