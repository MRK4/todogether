"use server";

import { auth } from "@/auth";
import {
  createBoard as createBoardInDb,
  updateBoardTitle as updateBoardTitleInDb,
  updateBoardLocked as updateBoardLockedInDb,
  deleteBoard as deleteBoardInDb,
  type CreateBoardResult,
  type UpdateBoardResult,
  type DeleteBoardResult,
} from "@/lib/boards";
import { prisma } from "@/lib/prisma";

export async function createBoard(title: string): Promise<CreateBoardResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }
  return createBoardInDb(userId, title);
}

async function ensureBoardOwner(boardId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true },
  });
  if (!board || board.ownerId !== userId) return null;
  return userId;
}

export async function updateBoardTitle(
  boardId: string,
  title: string
): Promise<UpdateBoardResult> {
  if (!(await ensureBoardOwner(boardId))) {
    return { success: false, error: "Unauthorized" };
  }
  return updateBoardTitleInDb(boardId, title);
}

export async function updateBoardLocked(
  boardId: string,
  locked: boolean
): Promise<UpdateBoardResult> {
  if (!(await ensureBoardOwner(boardId))) {
    return { success: false, error: "Unauthorized" };
  }
  return updateBoardLockedInDb(boardId, locked);
}

export async function deleteBoard(boardId: string): Promise<DeleteBoardResult> {
  if (!(await ensureBoardOwner(boardId))) {
    return { success: false, error: "Unauthorized" };
  }
  return deleteBoardInDb(boardId);
}
