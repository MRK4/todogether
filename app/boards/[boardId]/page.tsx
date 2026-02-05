import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { getBoardWithColumnsAndTasks, getBoardsForUser } from "@/lib/boards";
import { BoardView } from "@/app/board-view";

type PageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: PageProps) {
  const { boardId } = await params;
  const session = await auth();

  const boardData = await getBoardWithColumnsAndTasks(boardId);
  if (!boardData) {
    notFound();
  }

  if (session?.user?.id) {
    const userBoards = await getBoardsForUser(session.user.id);
    const canAccess = userBoards.some((b) => b.id === boardId);
    if (!canAccess) {
      notFound();
    }
  }

  return (
    <BoardView boardId={boardId} board={boardData} />
  );
}
