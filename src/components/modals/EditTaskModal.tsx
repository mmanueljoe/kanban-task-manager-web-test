import { Modal } from '@components/ui/Modal';
import { useBoards } from '@/hooks/useBoards';
import { useUi } from '@/hooks/useUi';
import type { Task } from '@/types/types';
import { TaskForm, type TaskFormValues } from './TaskForm';

type EditTaskModalProps = {
  open: boolean;
  onClose: () => void;
  columnOptions: { value: string; label: string }[];
  boardIndex: number | null;
  columnName: string | null;
  taskTitle: string | null;
};

export function EditTaskModal({
  open,
  onClose,
  columnOptions,
  boardIndex,
  columnName,
  taskTitle,
}: EditTaskModalProps) {
  const { boards, dispatch } = useBoards();
  const { showToast, startLoading, stopLoading } = useUi();

  const board =
    boardIndex !== null && boardIndex >= 0 ? boards[boardIndex] : null;
  const column =
    board && columnName
      ? board.columns.find((c) => c.name === columnName)
      : null;
  const task =
    column && taskTitle
      ? column.tasks.find((t) => t.title === taskTitle)
      : null;

  const effectiveColumnName =
    columnName ?? task?.status ?? columnOptions[0]?.value ?? '';

  const initialValues: TaskFormValues = {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? effectiveColumnName,
    subtasks: task?.subtasks?.map((s) => s.title) ?? ['', ''],
  };

  const handleSubmit = (values: TaskFormValues) => {
    if (boardIndex == null || !effectiveColumnName || !taskTitle || !task) {
      showToast({
        type: 'error',
        message: 'Could not update task. Please try again.',
      });
      onClose();
      return;
    }

    const updatedTask: Task = {
      ...task,
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      subtasks: values.subtasks
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => ({
          title: s,
          isCompleted:
            task.subtasks?.find((subtask) => subtask.title === s)
              ?.isCompleted ?? false,
        })),
    };

    startLoading('editTask');
    try {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          boardIndex,
          columnName: effectiveColumnName,
          taskTitle,
          task: updatedTask,
        },
      });
      showToast({ type: 'success', message: 'Task changes saved' });
    } finally {
      stopLoading('editTask');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-label="Edit task">
      <h2 className="app-modal-title">Edit Task</h2>
      <TaskForm
        mode="edit"
        initialValues={initialValues}
        columns={columnOptions}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
