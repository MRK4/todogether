import { NextRequest, NextResponse } from "next/server";

import { getBoardWithColumnsAndTasks } from "@/lib/boards";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const board = await getBoardWithColumnsAndTasks(boardId);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(board);
}
