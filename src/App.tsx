import { useState, useCallback, useRef, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { useFilters } from './context/useFilters';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { useProfiles } from './hooks/useProfiles';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import { useIsMobile } from './hooks/useIsMobile';
import { FilterBar } from './components/filters/FilterBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileFeed } from './components/layout/MobileFeed';
import { WorldMap } from './components/map/WorldMap';
import { AddProfileModal } from './components/profile-form/AddProfileModal';
import { VoteBanner } from './components/voting/VoteBanner';

const SIDEBAR_KEY = 'opinio_sidebar_widths';
const DEFAULT_LEFT = 360;
const DEFAULT_RIGHT = 360;
const MIN_WIDTH = 260;
const MAX_WIDTH = 500;

function clamp(v: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, v));
}

function loadSidebarWidths(): { left: number; right: number } {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw) {
      const { left, right } = JSON.parse(raw);
      return { left: clamp(left), right: clamp(right) };
    }
  } catch { /* ignore */ }
  return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
}

function saveSidebarWidths(widths: { left: number; right: number }) {
  localStorage.setItem(SIDEBAR_KEY, JSON.stringify(widths));
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

function ResizeHandle({ side, onDrag }: { side: 'left' | 'right'; onDrag: (delta: number) => void }) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastX.current = e.clientX;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - lastX.current;
      lastX.current = ev.clientX;
      onDrag(side === 'left' ? delta : -delta);
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [onDrag, side]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 transition-colors shrink-0"
    />
  );
}

function AppContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const isMobile = useIsMobile();
  const { country, role } = useFilters();
  const [sidebarWidths, setSidebarWidths] = useState(loadSidebarWidths);
  const { t } = useI18n();

  const positiveQuery = useProfiles({ type: 'positive', country, role });
  const negativeQuery = useProfiles({ type: 'negative', country, role });

  useRealtimeUpdates();

  useEffect(() => {
    saveSidebarWidths(sidebarWidths);
  }, [sidebarWidths]);

  const handleLeftDrag = useCallback((delta: number) => {
    setSidebarWidths((prev) => ({ ...prev, left: clamp(prev.left + delta) }));
  }, []);

  const handleRightDrag = useCallback((delta: number) => {
    setSidebarWidths((prev) => ({ ...prev, right: clamp(prev.right + delta) }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-surface">
      <FilterBar onAddProfile={() => setShowAddModal(true)} />

      {isMobile ? (
        <MobileFeed
          positiveProfiles={positiveQuery.data?.profiles ?? []}
          positiveRecent={positiveQuery.data?.recentlyAdded ?? []}
          negativeProfiles={negativeQuery.data?.profiles ?? []}
          negativeRecent={negativeQuery.data?.recentlyAdded ?? []}
        />
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div style={{ width: sidebarWidths.left }} className="shrink-0">
            <Sidebar
              title={t.trending}
              profiles={positiveQuery.data?.profiles ?? []}
              recentlyAdded={positiveQuery.data?.recentlyAdded ?? []}
              accentColor="positive"
            />
          </div>
          <ResizeHandle side="left" onDrag={handleLeftDrag} />
          <div className="relative flex-1 min-w-0">
            <WorldMap />
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <VoteBanner />
            </div>
          </div>
          <ResizeHandle side="right" onDrag={handleRightDrag} />
          <div style={{ width: sidebarWidths.right }} className="shrink-0">
            <Sidebar
              title={t.falling}
              profiles={negativeQuery.data?.profiles ?? []}
              recentlyAdded={negativeQuery.data?.recentlyAdded ?? []}
              accentColor="negative"
            />
          </div>
        </div>
      )}

      {showAddModal && <AddProfileModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <FilterProvider>
          <AppContent />
        </FilterProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
