import { useState, useCallback, useRef, useEffect } from 'react';
import { isOrderLocked } from './utils/voteLock';
import { Routes, Route, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { useFilters } from './context/useFilters';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { useProfiles } from './hooks/useProfiles';
import { useProfile } from './hooks/useProfile';
import { usePersonBreakdown } from './hooks/usePersonBreakdown';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import { useIsMobile } from './hooks/useIsMobile';
import { FilterBar } from './components/filters/FilterBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileFeed } from './components/layout/MobileFeed';
import { WorldMap } from './components/map/WorldMap';
import { DesktopProfileModal } from './components/profile/DesktopProfileModal';
import { ProfileDetailModal } from './components/profile/ProfileDetailModal';
import { AddProfileModal } from './components/profile-form/AddProfileModal';
import { VoteBanner } from './components/voting/VoteBanner';
import { SettingsModal } from './components/filters/SettingsModal';
import { AboutModal } from './components/filters/AboutModal';
import { PrivacyModal } from './components/filters/PrivacyModal';
import { StatsModal } from './components/filters/StatsModal';
import { SupportModal } from './components/filters/SupportModal';

const SIDEBAR_KEY = 'opinio_sidebar_widths_v3';
const DEFAULT_LEFT = 520;
const DEFAULT_RIGHT = 520;
const MIN_WIDTH = 300;
const MAX_WIDTH = 700;

const BASE_URL = 'https://opinio.live';
const DEFAULT_TITLE = 'Opinio';
const DEFAULT_DESCRIPTION = 'Discover who is rising and falling worldwide in real time. Vote on statements and public figures, explore country trends, and see live rankings refreshed every 24 hours.';

type SeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  const meta = existing ?? document.createElement('meta');
  Object.entries(attrs).forEach(([key, value]) => meta.setAttribute(key, value));
  if (!existing) document.head.appendChild(meta);
}

function upsertCanonical(href: string) {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (existing) {
    existing.href = href;
    return;
  }
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = href;
  document.head.appendChild(link);
}

function getSeoMeta(pathname: string): SeoMeta {
  if (pathname === '/stats') {
    return {
      title: DEFAULT_TITLE,
      description: 'See the most active voters by likes and dislikes across countries on Opinio.',
      canonicalPath: '/stats',
    };
  }
  if (pathname === '/about') {
    return {
      title: DEFAULT_TITLE,
      description: 'Learn how Opinio works: fast social voting, expiring votes after 24 hours, and live world trends.',
      canonicalPath: '/about',
    };
  }
  if (pathname === '/privacy') {
    return {
      title: DEFAULT_TITLE,
      description: 'Opinio privacy notice: what we collect, why, retention, and your rights under GDPR.',
      canonicalPath: '/privacy',
    };
  }
  if (pathname === '/support') {
    return {
      title: DEFAULT_TITLE,
      description: 'Contact Opinio support, manage your tickets, and get help with voting, profiles, and account settings.',
      canonicalPath: '/support',
    };
  }
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonicalPath: '/',
  };
}

function applySeo(pathname: string) {
  const meta = getSeoMeta(pathname);
  const canonicalUrl = `${BASE_URL}${meta.canonicalPath}`;
  document.title = meta.title;
  upsertMeta('meta[name="description"]', { name: 'description', content: meta.description });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
  upsertCanonical(canonicalUrl);
}

function applyProfileSeo(name: string, description: string, id: string) {
  const title = `${name} — Opinio`;
  const canonicalUrl = `${BASE_URL}/p/${id}`;
  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertCanonical(canonicalUrl);
}

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

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isCompact = useIsMobile(1366);
  const { country, roles } = useFilters();
  const [sidebarWidths, setSidebarWidths] = useState(loadSidebarWidths);
  const { t } = useI18n();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);

  const positiveQuery = useProfiles({ type: 'positive', country, roles });
  const negativeQuery = useProfiles({ type: 'negative', country, roles });

  useRealtimeUpdates();

  useEffect(() => {
    const id = setInterval(() => {
      if (!isOrderLocked()) {
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
      }
    }, 10_000);
    return () => clearInterval(id);
  }, [queryClient]);

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
    <div className="h-dvh flex flex-col bg-surface">
      <FilterBar onAddProfile={() => navigate('/add' + location.search)} />

      {isMobile ? (
        <MobileFeed
          positiveProfiles={positiveQuery.data?.profiles ?? []}
          positiveRecent={positiveQuery.data?.recentlyAdded ?? []}
          negativeProfiles={negativeQuery.data?.profiles ?? []}
          negativeRecent={negativeQuery.data?.recentlyAdded ?? []}
        />
      ) : isCompact ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0">
              <Sidebar
                title={t.trending}
                profiles={positiveQuery.data?.profiles ?? []}
                recentlyAdded={positiveQuery.data?.recentlyAdded ?? []}
                accentColor="positive"
              />
            </div>
            <div className="w-px bg-border shrink-0" />
            <div className="flex-1 min-w-0">
              <Sidebar
                title={t.falling}
                profiles={negativeQuery.data?.profiles ?? []}
                recentlyAdded={negativeQuery.data?.recentlyAdded ?? []}
                accentColor="negative"
              />
            </div>
          </div>
          <VoteBanner />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div
            style={{ width: sidebarWidths.left, maxWidth: 'calc(50vw - 250px)' }}
            className="shrink-0"
          >
            <Sidebar
              title={t.trending}
              profiles={positiveQuery.data?.profiles ?? []}
              recentlyAdded={positiveQuery.data?.recentlyAdded ?? []}
              accentColor="positive"
            />
          </div>
          <ResizeHandle side="left" onDrag={handleLeftDrag} />
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <WorldMap />
            <VoteBanner />
          </div>
          <ResizeHandle side="right" onDrag={handleRightDrag} />
          <div
            style={{ width: sidebarWidths.right, maxWidth: 'calc(50vw - 250px)' }}
            className="shrink-0"
          >
            <Sidebar
              title={t.falling}
              profiles={negativeQuery.data?.profiles ?? []}
              recentlyAdded={negativeQuery.data?.recentlyAdded ?? []}
              accentColor="negative"
            />
          </div>
        </div>
      )}

      {/* Modal routes render here */}
      <Outlet />

      {/* Vote allowance bar — mobile only (desktop renders inside map column) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
          <VoteBanner />
        </div>
      )}
    </div>
  );
}

function AddRoute() {
  const navigate = useNavigate();
  return <AddProfileModal onClose={() => navigate(-1)} />;
}

function SettingsRoute() {
  const navigate = useNavigate();
  return <SettingsModal onClose={() => navigate(-1)} />;
}

function AboutRoute() {
  const navigate = useNavigate();
  return <AboutModal onClose={() => navigate(-1)} />;
}

function PrivacyRoute() {
  const navigate = useNavigate();
  return <PrivacyModal onClose={() => navigate(-1)} />;
}

function StatsRoute() {
  const navigate = useNavigate();
  return <StatsModal onClose={() => navigate(-1)} />;
}

function SupportRoute() {
  const navigate = useNavigate();
  return <SupportModal onClose={() => navigate(-1)} />;
}

function ProfileDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { data: profile, isLoading } = useProfile(id ?? null);
  const { data: breakdown, isLoading: breakdownLoading } = usePersonBreakdown(id ?? null);

  useEffect(() => {
    if (profile) applyProfileSeo(profile.name, profile.description, profile.id);
  }, [profile]);

  if (isMobile) {
    if (isLoading || !profile) return null;
    return (
      <ProfileDetailModal
        profile={profile}
        breakdown={breakdown}
        isLoading={breakdownLoading}
        onClose={() => navigate('/' + location.search)}
      />
    );
  }

  return <DesktopProfileModal profileId={id ?? ''} />;
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Don't override SEO for profile pages — ProfileDetailRoute handles that
    if (!location.pathname.startsWith('/p/')) {
      applySeo(location.pathname);
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="add" element={<AddRoute />} />
        <Route path="settings" element={<SettingsRoute />} />
        <Route path="about" element={<AboutRoute />} />
        <Route path="privacy" element={<PrivacyRoute />} />
        <Route path="stats" element={<StatsRoute />} />
        <Route path="support" element={<SupportRoute />} />
        <Route path="p/:id" element={<ProfileDetailRoute />} />
      </Route>
    </Routes>
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
