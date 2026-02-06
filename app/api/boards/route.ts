import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBoardsForUser } from "@/lib/boards";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }
  const boards = await getBoardsForUser(session.user.id);
  return NextResponse.json(boards);
}
