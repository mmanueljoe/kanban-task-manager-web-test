export type StoredUser = {
  id: string;
  name: string;
  email: string;
};

export type Auth = {
  isLoggedIn: boolean;
  user: StoredUser | null;
};

export type User = StoredUser;

export type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
};

export type ThemeContextType = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

export type TaskDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  boardIndex: number | null;
  columnName: string | null;
  taskTitle: string | null;
};

export type Subtask = {
  title: string;
  isCompleted: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  subtasks?: Subtask[];
};

export type RawTask = Omit<Task, 'id'> & { id?: string };

export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type Column = {
  name: string;
  tasks: Task[];
};

export type Board = {
  name: string;
  columns: Column[];
};

export type BoardsData = {
  boards: Board[];
};

export type BoardsState = {
  boards: Board[];
};

export type BoardsContextType = {
  boards: Board[];
  dispatch: React.Dispatch<BoardsAction>;
};

export type BoardsAction =
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { boardIndex: number; board: Board } }
  | { type: 'DELETE_BOARD'; payload: { boardIndex: number } }
  | {
      type: 'ADD_TASK';
      payload: { boardIndex: number; columnName: string; task: Task };
    }
  | {
      type: 'UPDATE_TASK';
      payload: {
        boardIndex: number;
        columnName: string;
        taskTitle: string;
        task: Task;
      };
    }
  | {
      type: 'DELETE_TASK';
      payload: { boardIndex: number; columnName: string; taskTitle: string };
    }
  | {
      type: 'REORDER_TASK';
      payload: {
        boardIndex: number;
        columnName: string;
        fromIndex: number;
        toIndex: number;
      };
    }
  | {
      type: 'MOVE_TASK';
      payload: {
        boardIndex: number;
        fromColumn: string;
        toColumn: string;
        taskTitle: string;
      };
    }
  | {
      type: 'TOGGLE_SUBTASK';
      payload: {
        boardIndex: number;
        columnName: string;
        taskTitle: string;
        subtaskTitle: string;
      };
    }
  | { type: 'SET_BOARDS'; payload: { boards: Board[] } }
  | {
      type: 'ADD_COLUMN';
      payload: { boardIndex: number; columnName: string };
    };

export type UiToast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

export type UiState = {
  loadingKeys: string[];
  toasts: UiToast[];
};

export type UiContextType = {
  state: UiState;
  showToast: (params: Omit<UiToast, 'id'>) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key?: string) => boolean;
  dismissToast: (id: string) => void;
};
