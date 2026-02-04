import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { useBoards } from '@/hooks/useBoards';
import { useUi } from '@/hooks/useUi';

type DeleteTaskModalProps = {
  open: boolean;
  onClose: () => void;
  taskTitle: string;
  boardIndex: number | null;
  columnName: string | null;
};

export function DeleteTaskModal({
  open,
  onClose,
  taskTitle,
  boardIndex,
  columnName,
}: DeleteTaskModalProps) {
  const { dispatch } = useBoards();
  const { startLoading, stopLoading, showToast } = useUi();

  const handleConfirm = () => {
    if (boardIndex === null || !columnName || !taskTitle) {
      showToast({
        type: 'error',
        message: 'Could not delete task. Please try again.',
      });
      onClose();
      return;
    }

    startLoading('deleteTask');
    try {
      dispatch({
        type: 'DELETE_TASK',
        payload: {
          boardIndex,
          columnName,
          taskTitle,
        },
      });
      showToast({ type: 'success', message: 'Task deleted' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast({
          type: 'error',
          message: `Failed to delete task: ${error.message}`,
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to delete task. Please try again.',
        });
      }
    } finally {
      stopLoading('deleteTask');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-label="Delete task">
      <h2 className="app-modal-title app-modal-delete-title">
        Delete this task?
      </h2>
      <p
        className="body-l"
        style={{
          color: 'var(--text-muted)',
          margin: '0 0 24px 0',
          lineHeight: 1.6,
        }}
      >
        Are you sure you want to delete the &lsquo;{taskTitle}&rsquo; task and
        its subtasks? This action cannot be reversed.
      </p>
      <div className="app-modal-actions">
        <Button
          type="button"
          variant="destructive"
          size="large"
          onClick={handleConfirm}
        >
          Delete
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="large"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
