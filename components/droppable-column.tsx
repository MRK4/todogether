"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type DroppableColumnProps = {
  id: string;
  taskListContent: ReactNode;
  addTaskButton?: ReactNode | null;
};

function DropPlaceholder() {
  return (
    <div
      className="flex min-h-[84px] w-full flex-col rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-6 shadow-sm"
      aria-hidden
    />
  );
}

export function DroppableColumn({
  id,
  taskListContent,
  addTaskButton,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[120px] flex-1 flex-col gap-3 transition-colors ${
        isOver ? "rounded-lg bg-primary/5" : ""
      }`}
    >
      {isOver ? (
        <DropPlaceholder />
      ) : (
        <>
          {taskListContent}
          {addTaskButton ?? null}
        </>
      )}
    </div>
  );
}
