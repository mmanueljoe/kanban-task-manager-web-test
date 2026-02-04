import { useState } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { RemovableInput } from '@components/ui/RemovableInput';
import { useBoards } from '@/hooks/useBoards';
import { useUi } from '@/hooks/useUi';
import type { Board } from '@/types/types';

type EditBoardModalProps = {
  open: boolean;
  onClose: () => void;
  boardName: string;
  columnNames: string[];
  boardIndex: number | null;
  originalBoard: Board;
};

export function EditBoardModal({
  open,
  onClose,
  boardName: initialName,
  columnNames: initialColumns,
  boardIndex,
  originalBoard,
}: EditBoardModalProps) {
  const { dispatch } = useBoards();
  const { startLoading, stopLoading, showToast } = useUi();
  const [name, setName] = useState(initialName);
  const [columns, setColumns] = useState(initialColumns);

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

    if (boardIndex == null) {
      showToast({
        type: 'error',
        message: 'Could not update board. Please try again.',
      });
      onClose();
      return;
    }
    const cleanedColumns = columns
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const updatedColumns = cleanedColumns.map((colName) => {
      const existing = originalBoard.columns.find((c) => c.name === colName);
      return existing
        ? { ...existing, name: colName }
        : { name: colName, tasks: [] };
    });

    const updatedBoard: Board = {
      ...originalBoard,
      name: name.trim() || originalBoard.name,
      columns: updatedColumns,
    };
    startLoading('editBoard');
    try {
      dispatch({
        type: 'UPDATE_BOARD',
        payload: { boardIndex, board: updatedBoard },
      });
      showToast({ type: 'success', message: 'Board updated' });
    } finally {
      stopLoading('editBoard');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-label="Edit board">
      <h2 className="app-modal-title">Edit Board</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <Input
            id="edit-board-name"
            label="Board Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Platform Launch"
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
            <RemovableInput
              key={i}
              id={`edit-board-column-${i}`}
              value={val}
              onChange={(v) => updateColumn(i, v)}
              onRemove={() => removeColumn(i)}
              placeholder="e.g. In Progress"
            />
          ))}
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
