import { describe, it, expect } from 'vitest';
import { boardsReducer } from '@/utils/boardsReducer';
import type { BoardsState, BoardsAction } from '@/types/types';

const initialState: BoardsState = {
  boards: [],
};

describe('boardsReducer', () => {
  it('returns initial state for unknown action', () => {
    const action: BoardsAction = { type: 'UNKNOWN' } as unknown as BoardsAction;
    expect(boardsReducer(initialState, action)).toEqual(initialState);
  });

  it('handles ADD_BOARD', () => {
    const action: BoardsAction = {
      type: 'ADD_BOARD',
      payload: { name: 'New Board', columns: [] },
    };
    const newState = boardsReducer(initialState, action);
    expect(newState.boards).toEqual([{ name: 'New Board', columns: [] }]);
  });

  it('handles UPDATE_BOARD', () => {
    const state: BoardsState = {
      boards: [{ name: 'Old Board', columns: [] }],
    };
    const action: BoardsAction = {
      type: 'UPDATE_BOARD',
      payload: { boardIndex: 0, board: { name: 'Updated Board', columns: [] } },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].name).toBe('Updated Board');
  });

  it('handles DELETE_BOARD', () => {
    const state: BoardsState = {
      boards: [
        { name: 'Board 1', columns: [] },
        { name: 'Board 2', columns: [] },
      ],
    };
    const action: BoardsAction = {
      type: 'DELETE_BOARD',
      payload: { boardIndex: 1 },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards).toHaveLength(1);
    expect(newState.boards[0].name).toBe('Board 1');
  });

  it('handles ADD_TASK', () => {
    const state: BoardsState = {
      boards: [{ name: 'Board', columns: [{ name: 'Todo', tasks: [] }] }],
    };
    const action: BoardsAction = {
      type: 'ADD_TASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        task: {
          id: 'task-1',
          title: 'New Task',
          description: '',
          status: 'Todo',
        },
      },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].columns[0].tasks).toHaveLength(1);
    expect(newState.boards[0].columns[0].tasks[0].title).toBe('New Task');
  });

  it('handles UPDATE_TASK', () => {
    const state: BoardsState = {
      boards: [
        {
          name: 'Board',
          columns: [
            {
              name: 'Todo',
              tasks: [
                {
                  id: 'task-1',
                  title: 'Old Task',
                  description: '',
                  status: 'Todo',
                },
              ],
            },
          ],
        },
      ],
    };
    const action: BoardsAction = {
      type: 'UPDATE_TASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        taskTitle: 'Old Task',
        task: {
          id: 'task-1',
          title: 'Updated Task',
          description: '',
          status: 'Todo',
        },
      },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].columns[0].tasks[0].title).toBe('Updated Task');
  });

  it('handles DELETE_TASK', () => {
    const state: BoardsState = {
      boards: [
        {
          name: 'Board',
          columns: [
            {
              name: 'Todo',
              tasks: [
                {
                  id: 'task-1',
                  title: 'Task to Delete',
                  description: '',
                  status: 'Todo',
                },
              ],
            },
          ],
        },
      ],
    };
    const action: BoardsAction = {
      type: 'DELETE_TASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        taskTitle: 'Task to Delete',
      },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].columns[0].tasks).toHaveLength(0);
  });

  it('handles REORDER_TASK', () => {
    const state: BoardsState = {
      boards: [
        {
          name: 'Board',
          columns: [
            {
              name: 'Todo',
              tasks: [
                {
                  id: 'task-1',
                  title: 'Task 1',
                  description: '',
                  status: 'Todo',
                },
                {
                  id: 'task-2',
                  title: 'Task 2',
                  description: '',
                  status: 'Todo',
                },
              ],
            },
          ],
        },
      ],
    };
    const action: BoardsAction = {
      type: 'REORDER_TASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        fromIndex: 0,
        toIndex: 1,
      },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].columns[0].tasks[0].title).toBe('Task 2');
    expect(newState.boards[0].columns[0].tasks[1].title).toBe('Task 1');
  });

  it('handles MOVE_TASK', () => {
    const state: BoardsState = {
      boards: [
        {
          name: 'Board',
          columns: [
            {
              name: 'Todo',
              tasks: [
                {
                  id: 'task-1',
                  title: 'Move Me',
                  description: '',
                  status: 'Todo',
                },
              ],
            },
            { name: 'Done', tasks: [] },
          ],
        },
      ],
    };
    const action: BoardsAction = {
      type: 'MOVE_TASK',
      payload: {
        boardIndex: 0,
        fromColumn: 'Todo',
        toColumn: 'Done',
        taskTitle: 'Move Me',
      },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].columns[0].tasks).toHaveLength(0);
    expect(newState.boards[0].columns[1].tasks).toHaveLength(1);
    expect(newState.boards[0].columns[1].tasks[0].status).toBe('Done');
  });

  it('handles TOGGLE_SUBTASK', () => {
    const state: BoardsState = {
      boards: [
        {
          name: 'Board',
          columns: [
            {
              name: 'Todo',
              tasks: [
                {
                  id: 'task-1',
                  title: 'Task',
                  description: '',
                  status: 'Todo',
                  subtasks: [{ title: 'Subtask', isCompleted: false }],
                },
              ],
            },
          ],
        },
      ],
    };
    const action: BoardsAction = {
      type: 'TOGGLE_SUBTASK',
      payload: {
        boardIndex: 0,
        columnName: 'Todo',
        taskTitle: 'Task',
        subtaskTitle: 'Subtask',
      },
    };
    const newState = boardsReducer(state, action);
    expect(
      newState.boards[0].columns[0].tasks[0].subtasks![0].isCompleted
    ).toBe(true);
  });

  it('handles ADD_COLUMN', () => {
    const state: BoardsState = {
      boards: [{ name: 'Board', columns: [] }],
    };
    const action: BoardsAction = {
      type: 'ADD_COLUMN',
      payload: { boardIndex: 0, columnName: 'New Column' },
    };
    const newState = boardsReducer(state, action);
    expect(newState.boards[0].columns).toHaveLength(1);
    expect(newState.boards[0].columns[0].name).toBe('New Column');
  });

  it('handles SET_BOARDS', () => {
    const action: BoardsAction = {
      type: 'SET_BOARDS',
      payload: { boards: [{ name: 'New Boards', columns: [] }] },
    };
    const newState = boardsReducer(initialState, action);
    expect(newState.boards).toEqual([{ name: 'New Boards', columns: [] }]);
  });
});
