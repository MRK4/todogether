"use client";

import { GuestBoardProvider, GUEST_BOARD_ID, useGuestBoard } from "@/lib/guest-board-store";
import { BoardView } from "@/app/board-view";

function GuestBoardPageContent() {
  const { board } = useGuestBoard();
  return (
    <BoardView
      boardId={GUEST_BOARD_ID}
      board={board}
      isGuestMode
    />
  );
}

export function GuestBoardPage() {
  return (
    <GuestBoardProvider>
      <GuestBoardPageContent />
    </GuestBoardProvider>
  );
}
