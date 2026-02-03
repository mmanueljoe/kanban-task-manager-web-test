import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import iconCross from '@assets/icon-cross.svg';
import { useBoards } from '@/hooks/useBoards';
import { useUi } from '@/hooks/useUi';
import type { Board } from '@/types/types';

type AddBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AddBoardModal({ open, onClose }: AddBoardModalProps) {
  const { boards, dispatch } = useBoards();
  const { startLoading, stopLoading, showToast } = useUi();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [columns, setColumns] = useState<string[]>(['Todo', 'Doing']);
  const [errors, setErrors] = useState<{ name?: string; columns?: string }>({});

  const addColumn = () => setColumns((c) => [...c, '']);
  const removeColumn = (i: number) =>
    setColumns((c) => c.filter((_, idx) => idx !== i));
  const updateColumn = (i: number, v: string) =>
    setColumns((c) => {
      const next = [...c];
      next[i] = v;
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const cleanedColumns = columns
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const nextErrors: { name?: string; columns?: string } = {};

    if (!trimmedName) {
      nextErrors.name = 'Board name is required.';
      showToast({
        type: 'error',
        message: 'Please provide a name for the board.',
      });
    }

    if (cleanedColumns.length === 0) {
      nextErrors.columns = 'Please add at least one column for the new board.';
      showToast({
        type: 'error',
        message: 'Please add at least one column for the new board.',
      });
    }

    if (nextErrors.name || nextErrors.columns) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const newBoardIndex = boards.length;

    const newBoard: Board = {
      name: trimmedName,
      columns: cleanedColumns.map((colName) => ({
        name: colName,
        tasks: [],
      })),
    };

    startLoading('addBoard');
    try {
      dispatch({
        type: 'ADD_BOARD',
        payload: newBoard,
      });
      showToast({ type: 'success', message: 'Board created' });
      void navigate(`/board/${newBoardIndex}`);
    } finally {
      stopLoading('addBoard');
      onClose();
      setName('');
      setColumns(['Todo', 'Doing']);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-label="Add board">
      <h2 className="app-modal-title">Add New Board</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <Input
            id="board-name"
            label="Board Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Platform Launch"
            error={errors.name}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label
            className="input-label"
            style={{ display: 'block', marginBottom: 8 }}
          >
            Board Columns
          </label>
          {columns.map((val, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                type="text"
                className="input"
                value={val}
                onChange={(e) => updateColumn(i, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeColumn(i)}
                aria-label="Remove column"
                style={{
                  padding: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <img src={iconCross} alt="" width={14} height={14} />
              </button>
            </div>
          ))}
          {errors.columns && (
            <span className="input-error-text">{errors.columns}</span>
          )}
          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={addColumn}
            style={{ width: '100%' }}
          >
            + Add New Column
          </Button>
        </div>
        <div className="app-modal-actions">
          <Button type="submit" variant="primary" size="large">
            Create Board
          </Button>
        </div>
      </form>
    </Modal>
  );
}
