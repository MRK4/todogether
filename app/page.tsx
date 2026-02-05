import { auth } from "@/auth";
import { getBoardWithColumnsAndTasks } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { BoardView } from "./board-view";

export default async function Page() {
  const session = await auth();
  const ownerId = session?.user?.id ?? null;

  let board = await prisma.board.findFirst({
    where: ownerId ? { ownerId } : { ownerId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!board) {
    board = await prisma.board.create({
      data: {
        title: "Tableau principal",
        ...(ownerId ? { ownerId } : {}),
      },
      select: { id: true },
    });
  }
  const boardData = await getBoardWithColumnsAndTasks(board.id);
  return <BoardView boardId={board.id} board={boardData} />;
}
