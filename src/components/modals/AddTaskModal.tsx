import { Modal } from '@components/ui/Modal';
import { useBoards } from '@/hooks/useBoards';
import { useUi } from '@/hooks/useUi';
import { generateTaskId, type Task } from '@/types/types';
import { TaskForm, type TaskFormValues } from './TaskForm';

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  columnOptions: { value: string; label: string }[];
  boardIndex: number | null;
};

export function AddTaskModal({
  open,
  onClose,
  columnOptions,
  boardIndex,
}: AddTaskModalProps) {
  const { dispatch } = useBoards();
  const { startLoading, stopLoading, showToast } = useUi();

  const handleSubmit = (values: TaskFormValues) => {
    if (boardIndex == null) {
      showToast({
        type: 'error',
        message: 'Could not determine which board to add the task to.',
      });
      return;
    }

    const { title, description, status, subtasks } = values;

    const newTask: Task = {
      id: generateTaskId(),
      title: title.trim(),
      description: description.trim(),
      status,
      subtasks: subtasks
        .filter((s) => s.length > 0)
        .map((s) => ({ title: s, isCompleted: false })),
    };

    startLoading('addTask');
    try {
      dispatch({
        type: 'ADD_TASK',
        payload: { boardIndex, columnName: status, task: newTask },
      });
      showToast({ type: 'success', message: 'Task created' });
    } finally {
      stopLoading('addTask');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-label="Add new task">
      <h2 className="app-modal-title">Add New Task</h2>
      <TaskForm
        mode="create"
        initialValues={{
          title: '',
          description: '',
          status: columnOptions[0]?.value ?? '',
          subtasks: ['', ''],
        }}
        columns={columnOptions}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
