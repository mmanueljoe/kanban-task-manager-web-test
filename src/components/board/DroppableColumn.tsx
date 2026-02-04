import { useDroppable } from '@dnd-kit/core';
import { encodeColumnId } from './boardDndUtils';
import type { ReactNode } from 'react';

const COLUMN_DOT_COLORS = [
  '#49C4E5',
  '#635FC7',
  '#67E2AE',
  '#E5A449',
  '#2A3FDB',
];

type DroppableColumnProps = {
  boardIndex: number;
  columnName: string;
  columnIndex: number;
  taskCount: number;
  children: ReactNode;
};

export function DroppableColumn({
  boardIndex,
  columnName,
  columnIndex,
  taskCount,
  children,
}: DroppableColumnProps) {
  const id = encodeColumnId(boardIndex, columnName);
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className="app-board-column"
      style={{
        outline: isOver ? '2px dashed var(--accent, #635FC7)' : undefined,
        outlineOffset: 4,
      }}
    >
      <div className="app-board-column-header">
        <span
          className="app-board-column-dot"
          style={{
            backgroundColor:
              COLUMN_DOT_COLORS[columnIndex % COLUMN_DOT_COLORS.length],
          }}
        />
        <h2 className="app-board-column-title">
          {columnName} ({taskCount})
        </h2>
      </div>
      <ul className="app-board-tasks">{children}</ul>
    </section>
  );
}
