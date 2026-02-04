import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

const { mockUseBoards, mockUseCurrentBoard } = vi.hoisted(() => ({
  mockUseBoards: vi.fn(() => ({
    dispatch: vi.fn(),
  })),
  mockUseCurrentBoard: vi.fn(() => ({
    board: {
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
                { title: 'Subtask 1', isCompleted: true },
                { title: 'Subtask 2', isCompleted: false },
              ],
            },
          ],
        },
        { name: 'Done', tasks: [] },
      ],
    },
    boardIndex: 0,
  })),
}));

// Mock components
vi.mock('@components/ui/Button', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => (
    <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  ),
}));

vi.mock('@components/ui/Modal', () => ({
  Modal: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
}));

// Mock hooks
vi.mock('@/hooks/useBoards', () => ({
  useBoards: mockUseBoards,
}));

vi.mock('@/hooks/useCurrentBoard', () => ({
  useCurrentBoard: mockUseCurrentBoard,
}));

// Mock modals
vi.mock('@/components/modals/TaskDetailsModal', () => ({
  TaskDetailsModal: ({ open }: { open: boolean }) =>
    open ? <div>TaskDetailsModal</div> : null,
}));

vi.mock('@/components/modals/AddColumnModal', () => ({
  AddColumnModal: ({ open }: { open: boolean }) =>
    open ? <div>AddColumnModal</div> : null,
}));

// Import component after mocks are set up
import { BoardView } from '@/pages/BoardView';

// Helper to render with router
const renderWithRouter = (ui: ReactNode) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('BoardView', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default return value
    mockUseCurrentBoard.mockReturnValue({
      board: {
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
                  { title: 'Subtask 1', isCompleted: true },
                  { title: 'Subtask 2', isCompleted: false },
                ],
              },
            ],
          },
          { name: 'Done', tasks: [] },
        ],
      },
      boardIndex: 0,
    });
  });

  it('renders board with columns and tasks', () => {
    renderWithRouter(<BoardView />);
    // BoardView doesn't display the board name - it only shows columns
    expect(screen.getByText('Todo (1)')).toBeInTheDocument();
    expect(screen.getByText('Done (0)')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 subtasks')).toBeInTheDocument();
  });

  it('shows empty board message when no columns', () => {
    mockUseCurrentBoard.mockReturnValue({
      board: { name: 'Empty Board', columns: [] },
      boardIndex: 0,
    });

    renderWithRouter(<BoardView />);
    expect(
      screen.getByText(
        'This board is empty. Create a new column to get started.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('+ Add New Column')).toBeInTheDocument();
  });

  it('shows board not found when no board', () => {
    mockUseCurrentBoard.mockReturnValue({
      board: { name: 'Board not found', columns: [] },
      boardIndex: 0,
    });

    renderWithRouter(<BoardView />);
    expect(screen.getByText('Board not found')).toBeInTheDocument();
  });

  it('opens task details modal on task click', async () => {
    renderWithRouter(<BoardView />);
    await user.click(screen.getByText('Test Task'));
    expect(screen.getByText('TaskDetailsModal')).toBeInTheDocument();
  });

  it('opens add column modal on button click', async () => {
    renderWithRouter(<BoardView />);
    await user.click(screen.getByText('+ New Column'));
    expect(screen.getByText('AddColumnModal')).toBeInTheDocument();
  });

  it('sets up drag and drop context', () => {
    renderWithRouter(<BoardView />);
    expect(document.querySelector('[data-dnd-kit-overlay]')).toBeNull();
  });
});
