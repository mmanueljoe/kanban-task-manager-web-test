import { useParams } from 'react-router';
import { useBoards } from '@/hooks/useBoards';
import type { Board } from '@/types/types';

type UseCurrentBoardResult = {
  board: Board | null;
  boardIndex: number | null;
};

export function useCurrentBoard(): UseCurrentBoardResult {
  const { boards } = useBoards();
  const { boardId } = useParams<{ boardId?: string }>();

  const index =
    boardId != null && /^\d+$/.test(boardId) ? parseInt(boardId, 10) : null;

  const board =
    index != null &&
    Number.isFinite(index) &&
    index >= 0 &&
    index < boards.length
      ? boards[index]
      : null;

  return { board, boardIndex: index };
}
