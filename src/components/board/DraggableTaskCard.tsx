import { useDraggable, useDroppable } from '@dnd-kit/core';
import { TaskCard } from '@components/ui/TaskCard';
import { encodeTaskId } from './boardDndUtils';
import type { Task } from '@/types/types';

type DraggableTaskCardProps = {
  boardIndex: number;
  columnName: string;
  task: Task;
  subtaskSummary: string;
  onOpenDetails: () => void;
};

export function DraggableTaskCard({
  boardIndex,
  columnName,
  task,
  subtaskSummary,
  onOpenDetails,
}: DraggableTaskCardProps) {
  const id = encodeTaskId(boardIndex, columnName, task.title);

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id });

  const { setNodeRef: setDropRef } = useDroppable({ id });

  const setRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return (
    <TaskCard
      ref={setRef}
      title={task.title}
      subtitle={subtaskSummary}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={onOpenDetails}
      {...listeners}
      {...attributes}
    />
  );
}
