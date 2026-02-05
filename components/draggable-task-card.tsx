"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { TaskCard, type Task } from "@/components/task-card";

type DraggableTaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
};

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : undefined}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
