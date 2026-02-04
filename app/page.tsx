import { prisma } from "@/lib/prisma";
import { getBoardWithColumnsAndTasks } from "@/lib/boards";
import { BoardView } from "./board-view";

export default async function Page() {
  let board = await prisma.board.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!board) {
    board = await prisma.board.create({
      data: { title: "Tableau principal" },
      select: { id: true },
    });
  }
  const boardData = await getBoardWithColumnsAndTasks(board.id);
  return <BoardView boardId={board.id} board={boardData} />;
}
