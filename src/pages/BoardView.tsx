import { Link } from 'react-router';
import { useBoards } from '@/hooks/useBoards';
import { useCurrentBoard } from '@/hooks/useCurrentBoard';
import { Button } from '@components/ui/Button';
import type { Task } from '@/types/types';
import { useCallback, useState } from 'react';
import { TaskDetailsModal } from '@components/modals/TaskDetailsModal';
import { AddColumnModal } from '@components/modals/AddColumnModal';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  DraggableTaskCard,
  DroppableColumn,
  decodeTaskId,
  decodeColumnId,
} from '@components/board';

function getSubtaskSummary(task: Task): string {
  const total = task.subtasks?.length ?? 0;
  const done = task.subtasks?.filter((s) => s.isCompleted).length ?? 0;
  return `${done} of ${total} subtask${total !== 1 ? 's' : ''}`;
}

export function BoardView() {
  const [selectedTask, setSelectedTask] = useState<{
    boardIndex: number | null;
    columnName: string | null;
    taskTitle: string | null;
  } | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const { dispatch } = useBoards();
  const { board, boardIndex } = useCurrentBoard();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (boardIndex === null || !over || !board) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeTask = decodeTaskId(activeId);
      if (!activeTask || activeTask.boardIndex !== boardIndex) return;

      const overTask = decodeTaskId(overId);

      // If dropped on a task in the same column, reorder within that column.
      if (overTask && overTask.boardIndex === boardIndex) {
        const { columnName: fromColumn, taskTitle } = activeTask;
        const { columnName: toColumn, taskTitle: targetTitle } = overTask;

        const fromCol = board.columns.find((c) => c.name === fromColumn);
        const toCol = board.columns.find((c) => c.name === toColumn);

        if (!fromCol || !toCol) return;

        const fromIndex = fromCol.tasks.findIndex(
          (task) => task.title === taskTitle
        );
        const toIndex = toCol.tasks.findIndex(
          (task) => task.title === targetTitle
        );

        if (fromIndex === -1 || toIndex === -1) return;

        if (fromColumn === toColumn) {
          if (fromIndex === toIndex) return;
          dispatch({
            type: 'REORDER_TASK',
            payload: {
              boardIndex,
              columnName: fromColumn,
              fromIndex,
              toIndex,
            },
          });
          return;
        }
        // Different columns: fall through to column-level move below.
      }

      const columnData = decodeColumnId(overId);
      if (!columnData || columnData.boardIndex !== boardIndex || !activeTask) {
        return;
      }

      const { columnName: fromColumn, taskTitle } = activeTask;
      const toColumn = columnData.columnName;
      if (fromColumn === toColumn) return;

      dispatch({
        type: 'MOVE_TASK',
        payload: { boardIndex, fromColumn, toColumn, taskTitle },
      });
    },
    [board, boardIndex, dispatch]
  );

  if (!board) {
    return (
      <div className="app-main app-main-board">
        <h1 className="heading-xl app-section-title">Board not found</h1>
        <p className="body-l">This board does not exist or was removed.</p>
        <Link to="/">
          <Button variant="primary" size="large">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Empty board state - show prompt to create column
  const emptyBoardContent = board.columns.length === 0 && (
    <div className="app-empty-board">
      <h2 className="heading-l">
        This board is empty. Create a new column to get started.
      </h2>
      <p className="body-l" style={{ marginBottom: 24 }}>
        Create a new column to get started.
      </p>
      <Button
        variant="primary"
        size="large"
        onClick={() => setAddColumnOpen(true)}
      >
        + Add New Column
      </Button>
    </div>
  );

  if (board.columns.length === 0) {
    return (
      <div className="app-main app-main-board">
        {emptyBoardContent}
        <AddColumnModal
          open={addColumnOpen}
          onClose={() => setAddColumnOpen(false)}
          boardIndex={boardIndex}
        />
      </div>
    );
  }

  return (
    <div className="app-main app-main-board">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="app-board-columns">
          {board.columns.map((col, colIndex) => (
            <DroppableColumn
              key={col.name}
              boardIndex={boardIndex!}
              columnName={col.name}
              columnIndex={colIndex}
              taskCount={col.tasks.length}
            >
              {col.tasks.map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  boardIndex={boardIndex!}
                  columnName={col.name}
                  task={task}
                  subtaskSummary={getSubtaskSummary(task)}
                  onOpenDetails={() => {
                    setSelectedTask({
                      boardIndex,
                      columnName: col.name,
                      taskTitle: task.title,
                    });
                    setTaskModalOpen(true);
                  }}
                />
              ))}
            </DroppableColumn>
          ))}
          <button
            type="button"
            className="app-board-new-column"
            aria-label="Add new column"
            onClick={() => setAddColumnOpen(true)}
          >
            + New Column
          </button>
        </div>
      </DndContext>

      {selectedTask && (
        <TaskDetailsModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          boardIndex={selectedTask.boardIndex}
          columnName={selectedTask.columnName}
          taskTitle={selectedTask.taskTitle}
        />
      )}
      {addColumnOpen && (
        <AddColumnModal
          open={addColumnOpen}
          onClose={() => setAddColumnOpen(false)}
          boardIndex={boardIndex}
        />
      )}
    </div>
  );
}
