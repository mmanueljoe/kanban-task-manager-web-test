import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

// Define types for mock props
interface ModalProps {
  children: ReactNode;
  open: boolean;
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const {
  mockDispatch,
  mockStartLoading,
  mockStopLoading,
  mockShowToast,
  mockDismissToast,
  mockIsLoading,
} = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
  mockStartLoading: vi.fn(),
  mockStopLoading: vi.fn(),
  mockShowToast: vi.fn(),
  mockDismissToast: vi.fn(),
  mockIsLoading: vi.fn().mockReturnValue(false),
}));

const defaultBoardData = {
  boards: [
    {
      name: 'Test Board',
      columns: [
        {
          name: 'Todo',
          tasks: [
            {
              id: 'task-1',
              title: 'Test Task',
              description: 'Test description',
              status: 'Todo',
              subtasks: [
                { title: 'Subtask 1', isCompleted: false },
                { title: 'Subtask 2', isCompleted: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  dispatch: mockDispatch,
};

vi.mock('@components/ui/Modal', () => ({
  Modal: ({ children, open }: ModalProps) =>
    open ? <div>{children}</div> : null,
}));

vi.mock('@components/ui/Checkbox', () => ({
  Checkbox: ({ label, checked, onCheckedChange }: CheckboxProps) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onCheckedChange(!checked)}
      />
      {label}
    </label>
  ),
}));

vi.mock('@assets/icon-vertical-ellipsis.svg', () => ({
  default: 'mocked-svg',
}));

vi.mock('@/hooks/useBoards', () => ({
  useBoards: () => defaultBoardData,
}));

vi.mock('@/hooks/useUi', () => ({
  useUi: () => ({
    state: {
      loadingKeys: [],
      toasts: [],
    },
    startLoading: mockStartLoading,
    stopLoading: mockStopLoading,
    showToast: mockShowToast,
    dismissToast: mockDismissToast,
    isLoading: mockIsLoading,
  }),
}));

vi.mock('@/components/modals/EditTaskModal', () => ({
  EditTaskModal: ({ open }: { open: boolean }) =>
    open ? <div>EditTaskModal</div> : null,
}));

vi.mock('@/components/modals/DeleteTaskModal', () => ({
  DeleteTaskModal: ({
    open,
    onClose,
    taskTitle,
    boardIndex,
    columnName,
  }: {
    open: boolean;
    onClose: () => void;
    taskTitle: string;
    boardIndex: number | null;
    columnName: string | null;
  }) => {
    if (!open) return null;
    const handleConfirm = () => {
      mockStartLoading('deleteTask');
      mockDispatch({
        type: 'DELETE_TASK',
        payload: { boardIndex, columnName, taskTitle },
      });
      mockShowToast({ type: 'success', message: 'Task deleted' });
      mockStopLoading('deleteTask');
      onClose();
    };
    return (
      <div data-testid="delete-task-modal">
        <button onClick={handleConfirm}>Confirm Delete</button>
      </div>
    );
  },
}));

import { TaskDetailsModal } from '@/components/modals/TaskDetailsModal';

describe('TaskDetailsModal', () => {
  const user = userEvent.setup();
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    boardIndex: 0,
    columnName: 'Todo',
    taskTitle: 'Test Task',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onClose = vi.fn();
  });

  it('renders task details', () => {
    render(<TaskDetailsModal {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Subtasks (1 of 2)')).toBeInTheDocument();
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('toggles subtask completion', async () => {
    render(<TaskDetailsModal {...defaultProps} />);
    const checkbox = screen.getByLabelText('Subtask 1');
    await user.click(checkbox);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_SUBTASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        taskTitle: 'Test Task',
        subtaskTitle: 'Subtask 1',
      },
    });
  });

  it('opens edit modal on edit button click', async () => {
    render(<TaskDetailsModal {...defaultProps} />);
    const menuButton = screen.getByLabelText('More options');
    await user.click(menuButton);
    const editButton = screen.getByText('Edit Task');
    await user.click(editButton);

    expect(screen.getByText('EditTaskModal')).toBeInTheDocument();
  });

  it('opens delete confirmation modal and deletes task on confirm', async () => {
    render(<TaskDetailsModal {...defaultProps} />);
    const menuButton = screen.getByLabelText('More options');
    await user.click(menuButton);
    const deleteButton = screen.getByText('Delete Task');
    await user.click(deleteButton);

    expect(screen.getByTestId('delete-task-modal')).toBeInTheDocument();

    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'DELETE_TASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        taskTitle: 'Test Task',
      },
    });
    expect(mockStartLoading).toHaveBeenCalledWith('deleteTask');
    expect(mockStopLoading).toHaveBeenCalledWith('deleteTask');
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Task deleted',
    });
  });

  it('does not render if task not found', () => {
    const { container } = render(
      <TaskDetailsModal {...defaultProps} taskTitle="Non-existent Task" />
    );
    expect(container.firstChild).toBeNull();
  });
});
