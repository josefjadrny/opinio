import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider, useFilters } from './context/FilterContext';
import { useProfiles } from './hooks/useProfiles';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import { useIsMobile } from './hooks/useIsMobile';
import { FilterBar } from './components/filters/FilterBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileFeed } from './components/layout/MobileFeed';
import { WorldMap } from './components/map/WorldMap';
import { AddProfileModal } from './components/profile-form/AddProfileModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

function AppContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  const isMobile = useIsMobile();
  const { country, role } = useFilters();

  const positiveQuery = useProfiles({ type: 'positive', country, role });
  const negativeQuery = useProfiles({ type: 'negative', country, role });

  useRealtimeUpdates();

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
        <div className="flex-1 grid grid-cols-[320px_1fr_320px] min-h-0 overflow-hidden">
          <Sidebar
            title="Most Liked"
            profiles={positiveQuery.data?.profiles ?? []}
            recentlyAdded={positiveQuery.data?.recentlyAdded ?? []}
            accentColor="positive"
          />
          <WorldMap />
          <Sidebar
            title="Most Disliked"
            profiles={negativeQuery.data?.profiles ?? []}
            recentlyAdded={negativeQuery.data?.recentlyAdded ?? []}
            accentColor="negative"
          />
        </div>
      )}

      {showAddModal && <AddProfileModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <AppContent />
      </FilterProvider>
    </QueryClientProvider>
  );
}
