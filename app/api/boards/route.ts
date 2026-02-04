import { NextResponse } from "next/server";

import { getBoards } from "@/lib/boards";

export async function GET() {
  const boards = await getBoards();
  return NextResponse.json(boards);
}
