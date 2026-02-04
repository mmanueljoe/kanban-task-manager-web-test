import { useBoards } from '@/hooks/useBoards';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { TaskDetailsModalProps } from '@/types/types';
import { Modal } from '../ui/Modal';
import { Checkbox } from '../ui/Checkbox';
import { useState, useRef } from 'react';
import iconEllipsis from '@assets/icon-vertical-ellipsis.svg';
import { EditTaskModal } from './EditTaskModal';
import { DeleteTaskModal } from './DeleteTaskModal';

export function TaskDetailsModal({
  open,
  onClose,
  boardIndex,
  columnName,
  taskTitle,
}: TaskDetailsModalProps) {
  const { boards, dispatch } = useBoards();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const board = boardIndex !== null ? boards[boardIndex] : null;
  const column = board?.columns.find((c) => c.name === columnName);
  const task = column?.tasks.find((t) => t.title === taskTitle);

  if (!task || boardIndex === null || !columnName || !taskTitle) return null;

  const completedSubtasks =
    task.subtasks?.filter((s) => s.isCompleted).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  const handleSubtaskToggle = (subtaskTitle: string) => {
    dispatch({
      type: 'TOGGLE_SUBTASK',
      payload: {
        boardIndex,
        columnName,
        taskTitle,
        subtaskTitle,
      },
    });
  };

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirmed = () => {
    setIsDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} aria-label="Task details">
        <div className="app-task-details-header">
          <h2 className="app-modal-title" style={{ flex: 1, margin: 0 }}>
            {task.title}
          </h2>
          <div ref={menuRef} className="app-task-details-menu">
            <button
              type="button"
              aria-label="More options"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => setMenuOpen((o) => !o)}
              className="app-icon-btn"
            >
              <img src={iconEllipsis} alt="" width={5} height={20} />
            </button>
            {menuOpen && (
              <div role="menu" className="app-task-details-menu-panel">
                <button
                  type="button"
                  role="menuitem"
                  className="app-popover-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditOpen(true);
                  }}
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-popover-menu-item app-popover-menu-item-destructive"
                  onClick={handleDeleteClick}
                >
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>

        {task.description && (
          <p className="app-task-details-description">{task.description}</p>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <label
              className="input-label"
              style={{ display: 'block', marginBottom: 16 }}
            >
              Subtasks ({completedSubtasks} of {totalSubtasks})
            </label>
            <div className="app-task-details-subtasks">
              {task.subtasks.map((subtask) => (
                <Checkbox
                  key={subtask.title}
                  label={subtask.title}
                  checked={subtask.isCompleted}
                  onCheckedChange={() => handleSubtaskToggle(subtask.title)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="input-wrap">
          <label className="input-label">Current Status</label>
          <div className="app-task-details-status">
            {task.status || columnName}
          </div>
        </div>
      </Modal>

      <EditTaskModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        columnOptions={
          board
            ? board.columns.map((c) => ({ value: c.name, label: c.name }))
            : []
        }
        boardIndex={boardIndex}
        columnName={columnName}
        taskTitle={taskTitle}
      />

      <DeleteTaskModal
        open={isDeleteOpen}
        onClose={handleDeleteConfirmed}
        taskTitle={taskTitle}
        boardIndex={boardIndex}
        columnName={columnName}
      />
    </>
  );
}
