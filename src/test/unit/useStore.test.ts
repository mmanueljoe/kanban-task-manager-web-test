import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { User } from '@/types/types';

const { mockGetTheme, mockSetTheme, mockGetAuth, mockSetAuth } = vi.hoisted(
  () => ({
    mockGetTheme: vi.fn(() => 'light'),
    mockSetTheme: vi.fn(),
    mockGetAuth: vi.fn(() => ({ isLoggedIn: false, user: null })),
    mockSetAuth: vi.fn(),
  })
);

vi.mock('@/utils/localStorage', () => ({
  getTheme: mockGetTheme,
  setTheme: mockSetTheme,
  getAuth: mockGetAuth,
  setAuth: mockSetAuth,
}));

import { useStore } from '@/store/useStore';

const getInitialState = () => ({
  boards: [],
  theme: 'light' as const,
  user: null,
  isLoggedIn: false,
  loadingKeys: [],
  toasts: [],
});

describe('useStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const state = useStore.getState();
    useStore.setState(
      {
        ...getInitialState(),
        dispatch: state.dispatch,
        setTheme: state.setTheme,
        login: state.login,
        logout: state.logout,
        addLoadingKey: state.addLoadingKey,
        removeLoadingKey: state.removeLoadingKey,
        addToast: state.addToast,
        removeToast: state.removeToast,
      },
      true
    );
  });

  afterEach(() => {
    const state = useStore.getState();
    useStore.setState(
      {
        ...getInitialState(),
        dispatch: state.dispatch,
        setTheme: state.setTheme,
        login: state.login,
        logout: state.logout,
        addLoadingKey: state.addLoadingKey,
        removeLoadingKey: state.removeLoadingKey,
        addToast: state.addToast,
        removeToast: state.removeToast,
      },
      true
    );
  });

  it('initializes with default state', () => {
    const state = useStore.getState();
    expect(state.boards).toEqual([]);
    expect(state.theme).toBe('light');
    expect(state.user).toBeNull();
    expect(state.isLoggedIn).toBe(false);
    expect(state.loadingKeys).toEqual([]);
    expect(state.toasts).toEqual([]);
  });

  it('dispatches actions and updates boards via reducer', () => {
    const { dispatch } = useStore.getState();

    act(() => {
      dispatch({
        type: 'ADD_BOARD',
        payload: { name: 'Test Board', columns: [] },
      });
    });

    const state = useStore.getState();
    expect(state.boards).toEqual([{ name: 'Test Board', columns: [] }]);
  });

  it('sets theme and persists it', () => {
    const { setTheme } = useStore.getState();

    act(() => {
      setTheme('dark');
    });

    const state = useStore.getState();
    expect(state.theme).toBe('dark');
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('logs in user and persists auth', () => {
    const testUser: User = {
      id: '1',
      name: 'testuser',
      email: 'test@example.com',
    };
    const { login } = useStore.getState();

    act(() => {
      login(testUser);
    });

    const state = useStore.getState();
    expect(state.user).toEqual(testUser);
    expect(state.isLoggedIn).toBe(true);
    expect(mockSetAuth).toHaveBeenCalledWith({
      isLoggedIn: true,
      user: testUser,
    });
  });

  it('logs out user and clears auth', () => {
    const { logout } = useStore.getState();

    act(() => {
      logout();
    });

    const state = useStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoggedIn).toBe(false);
    expect(mockSetAuth).toHaveBeenCalledWith({
      isLoggedIn: false,
      user: null,
    });
  });

  it('manages loading keys', () => {
    const { addLoadingKey, removeLoadingKey } = useStore.getState();

    act(() => {
      addLoadingKey('fetchBoards');
    });

    expect(useStore.getState().loadingKeys).toEqual(['fetchBoards']);

    act(() => {
      removeLoadingKey('fetchBoards');
    });

    expect(useStore.getState().loadingKeys).toEqual([]);
  });

  it('manages toasts', () => {
    const testToast = {
      id: '1',
      message: 'Test toast',
      type: 'success' as const,
    };
    const { addToast, removeToast } = useStore.getState();

    act(() => {
      addToast(testToast);
    });

    expect(useStore.getState().toasts).toEqual([testToast]);

    act(() => {
      removeToast('1');
    });

    expect(useStore.getState().toasts).toEqual([]);
  });
});
