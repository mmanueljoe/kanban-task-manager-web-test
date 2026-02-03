import { useEffect, useState } from 'react';
import { setBoards } from '@/utils/localStorage';
import { useUi } from '@/hooks/useUi';
import { useStore } from './useStore';
import { fetchBoards } from '@/services/boards';
import { Button } from '@components/ui/Button';

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const { startLoading, stopLoading, showToast } = useUi();
  const dispatch = useStore((s) => s.dispatch);
  const boards = useStore((s) => s.boards);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    startLoading('initBoards');

    void (async () => {
      try {
        const loadedBoards = await fetchBoards();
        if (!cancelled) {
          dispatch({
            type: 'SET_BOARDS',
            payload: { boards: loadedBoards },
          });
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Failed to load boards';
          setLoadError(message);
          showToast({ type: 'error', message });
        }
      } finally {
        if (!cancelled) {
          stopLoading('initBoards');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, startLoading, stopLoading, showToast, retryAttempt]);

  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (state.boards.length > 0) {
        setBoards({ boards: state.boards });
      }
    });
    return unsub;
  }, []);

  if (loadError && boards.length === 0) {
    return (
      <div
        className="app-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          minHeight: '60vh',
        }}
      >
        <p className="body-l" style={{ color: 'var(--text-secondary)' }}>
          {loadError}
        </p>
        <Button
          type="button"
          variant="primary"
          size="large"
          onClick={() => setRetryAttempt((a) => a + 1)}
        >
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
