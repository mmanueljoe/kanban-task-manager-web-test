import axios from 'axios';
import type { Board } from '@/types/types';

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const boardsUrl = baseUrl ? `${baseUrl}/api/boards.json` : '/api/boards.json';

export async function fetchBoards(): Promise<Board[]> {
  const { data } = await axios.get<{ boards: Board[] }>(boardsUrl);
  return data.boards;
}
