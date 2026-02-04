import { useEffect } from 'react';
import { RouteProvider } from '@routes/RouteProvider';
import { useTheme } from '@hooks/useTheme';
import { UiProvider } from '@context/UiContext';
import { StoreHydration } from '@store/StoreHydration';
import { ToastHost } from '@components/ui/ToastHost';
import { LoadingOverlay } from '@components/ui/LoadingOverlay';

function AppContent() {
  const { theme } = useTheme();

  // Apply theme to document element so portals (modals, toasts) also get themed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-root">
      <UiProvider>
        <StoreHydration>
          <RouteProvider />
        </StoreHydration>
        <LoadingOverlay />
        <ToastHost />
      </UiProvider>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
