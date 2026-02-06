import { auth } from "@/auth";
import { getBoardWithColumnsAndTasks } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { BoardView } from "./board-view";
import { GuestBoardPage } from "./guest-board-page";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    return <GuestBoardPage />;
  }

  const ownerId = session.user.id;
  let board = await prisma.board.findFirst({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!board) {
    board = await prisma.board.create({
      data: {
        title: "Tableau principal",
        ownerId,
      },
      select: { id: true },
    });
  }
  const boardData = await getBoardWithColumnsAndTasks(board.id);
  return <BoardView boardId={board.id} board={boardData} />;
}
