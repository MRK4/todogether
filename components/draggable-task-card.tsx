"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { TaskCard, type Task } from "@/components/task-card";

type DraggableTaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
  disabled?: boolean;
};

export function DraggableTaskCard({ task, onClick, disabled }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    disabled,
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
      {...(disabled ? {} : { ...listeners, ...attributes })}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
