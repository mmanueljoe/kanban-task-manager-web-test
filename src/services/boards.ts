import axios from 'axios';
import type { Board, RawTask } from '@/types/types';
import { generateTaskId } from '@/types/types';

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const boardsUrl = baseUrl ? `${baseUrl}/api/boards.json` : '/api/boards.json';

type RawBoard = Omit<Board, 'columns'> & {
  columns: Array<{
    name: string;
    tasks: RawTask[];
  }>;
};

function ensureTaskIds(boards: RawBoard[]): Board[] {
  return boards.map((board) => ({
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.map((task) => ({
        ...task,
        id: task.id || generateTaskId(),
      })),
    })),
  }));
}

export async function fetchBoards(): Promise<Board[]> {
  const { data } = await axios.get<{ boards: RawBoard[] }>(boardsUrl);
  // Ensure all tasks have IDs for backward compatibility
  return ensureTaskIds(data.boards);
}
