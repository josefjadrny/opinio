import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { isOrderLocked } from './utils/voteLock';
import { Routes, Route, Outlet, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { MapPanelProvider } from './context/MapPanelContext';
import { useFilters } from './context/useFilters';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import type { Locale, Strings } from './i18n/strings';
import { SignInProvider } from './components/auth/SignInContext';
import { SignInModal } from './components/auth/SignInModal';
import { useProfiles } from './hooks/useProfiles';
import { useProfile } from './hooks/useProfile';
import { usePersonBreakdown } from './hooks/usePersonBreakdown';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import { useIsMobile } from './hooks/useIsMobile';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useModalClose } from './hooks/useModalClose';
import { FilterBar } from './components/filters/FilterBar';
import { Sidebar } from './components/layout/Sidebar';
import { OfflineBanner } from './components/common/Offline';
import { MobileFeed } from './components/layout/MobileFeed';
// Desktop map is code-split so d3-geo + topojson + the city table stay out of
// the main bundle (mobile never loads this chunk). MobileMapPanel is a tiny
// dependency-free shell that itself lazy-loads the shared map on first open.
const WorldMap = lazy(() => import('./components/map/WorldMap').then((m) => ({ default: m.WorldMap })));
import { MobileMapPanel } from './components/map/MobileMapPanel';
import { DesktopProfileModal } from './components/profile/DesktopProfileModal';
import { ProfileDetailModal } from './components/profile/ProfileDetailModal';
import { ProfileNotFoundModal } from './components/profile/ProfileNotFoundModal';
import { isNotFound } from './api/client';
import { UserDetailModal } from './components/profile/UserDetailModal';
import { CountryDetailModal } from './components/country/CountryDetailModal';
import { getCountryName, isKnownCountry } from './utils/countries';
import { AddProfileModal } from './components/profile-form/AddProfileModal';
import { AddOpinioFab } from './components/ui/AddOpinioFab';
import { VoteBanner } from './components/voting/VoteBanner';
import { HotBanner } from './components/banner/HotBanner';
import { AndroidAppBanner } from './components/banner/AndroidAppBanner';
import { SettingsModal } from './components/filters/SettingsModal';
import { AboutModal } from './components/filters/AboutModal';
import { PrivacyModal } from './components/filters/PrivacyModal';
import { TermsModal } from './components/filters/TermsModal';
import { StatsModal } from './components/filters/StatsModal';
import { slugToCategory } from './components/filters/statsCategory';
import { SupportModal } from './components/filters/SupportModal';
import { ViewerModeModal } from './components/filters/ViewerModeModal';
import { WelcomeModal } from './components/filters/WelcomeModal';
import { useMe } from './hooks/useMe';
import { useUser } from './hooks/useUser';

const SIDEBAR_KEY = 'opinio_sidebar_widths_v3';
const DEFAULT_LEFT = 520;
const DEFAULT_RIGHT = 520;
const MIN_WIDTH = 300;
const MAX_WIDTH = 700;

const BASE_URL = 'https://opinio.live';
const BRAND = 'Opinio';
const DEFAULT_TITLE = "Opinio - Vote on the world's opinions, country by country";
const DEFAULT_DESCRIPTION = 'An ad-free social voting platform from Europe. Share and vote on opinions about anything - from the headlines to everyday life - and see how every country feels, country by country, refreshed every 24h.';

// Non-English locales that get a URL prefix (/fr/about, /de/c/CZ, ...). English
// stays on the bare path. Mirrors the Cloudflare worker's PREFIX_LANGS and the
// API sitemap's PREFIX_LANGS — keep all three in sync. These prefixed URLs are
// crawler/entry-point URLs: the SPA strips the prefix for routing, sets the
// locale from it, and internal navigation continues on bare paths (the locale
// then persists as state, not in the URL).
const PREFIX_LOCALES: readonly string[] = ['cs', 'es', 'de', 'fr', 'it', 'pl'];

// The "/<lang>" prefix on the *current* URL, or '' for a bare (English) path.
// Used to build self-referencing canonicals so a prefixed page is never folded
// into its English equivalent.
function localePrefixOf(pathname: string): string {
  const seg = pathname.split('/')[1];
  return PREFIX_LOCALES.includes(seg) ? `/${seg}` : '';
}

function currentLocalePrefix(): string {
  return localePrefixOf(window.location.pathname);
}

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

// Maps a bare pathname to its localized seo key (in i18n Strings['seo']) and
// canonical path. Anything unmatched falls back to the home entry. Keep the keys
// in sync with the worker's STATIC_PAGES + STATIC_I18N (server-render source).
const SEO_PAGE_BY_PATH: Record<string, { key: string; canonicalPath: string }> = {
  '/stats': { key: 'stats', canonicalPath: '/stats' },
  '/stats/trending-countries': { key: 'statsTrendingCountries', canonicalPath: '/stats/trending-countries' },
  '/stats/top-voters': { key: 'statsTopVoters', canonicalPath: '/stats/top-voters' },
  '/about': { key: 'about', canonicalPath: '/about' },
  '/privacy': { key: 'privacy', canonicalPath: '/privacy' },
  '/terms': { key: 'terms', canonicalPath: '/terms' },
  '/support': { key: 'support', canonicalPath: '/support' },
  '/sign-in': { key: 'signIn', canonicalPath: '/sign-in' },
};

function getSeoMeta(pathname: string, seo: Strings['seo']): SeoMeta {
  const entry = SEO_PAGE_BY_PATH[pathname] ?? { key: 'home', canonicalPath: '/' };
  const strings = seo[entry.key] ?? { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  return { title: strings.title, description: strings.description, canonicalPath: entry.canonicalPath };
}

function applySeo(pathname: string, seo: Strings['seo'], prefix = '') {
  const meta = getSeoMeta(pathname, seo);
  const canonicalUrl = `${BASE_URL}${prefix}${meta.canonicalPath}`;
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
  const title = `${name} - ${BRAND}`;
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

function applyCountrySeo(code: string, seo: Strings['seo'], locale: Locale) {
  const name = getCountryName(code, locale);
  // Localized "how the world feels about <country>" template (mirrors the worker's
  // no-counts COUNTRY_SEO; the runtime SPA has no 24h counts handy). {country} is
  // the only token. Falls back to a plain title if a locale lacks the entry.
  const tpl = seo.country ?? { title: '{country} - Opinio', description: `Live rankings and votes from {country} on Opinio.` };
  const title = tpl.title.replace(/\{country\}/g, name);
  const description = tpl.description.replace(/\{country\}/g, name);
  const canonicalUrl = `${BASE_URL}${currentLocalePrefix()}/c/${code}`;
  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertCanonical(canonicalUrl);
}

function applyUserSeo(displayName: string, id: string, bio: string | null) {
  const title = `@${displayName} - ${BRAND}`;
  // A written bio is a unique, human description - far better than the
  // template every user page would otherwise share. Falls back when empty.
  const description = bio?.trim()
    ? bio.trim().slice(0, 200)
    : `${displayName}'s reported profiles and votes on Opinio.`;
  const canonicalUrl = `${BASE_URL}${currentLocalePrefix()}/u/${id}`;
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
  const { isLoading: meLoading } = useMe();
  const { country, roles, fresh, search } = useFilters();
  const [sidebarWidths, setSidebarWidths] = useState(loadSidebarWidths);
  // HotBanner and MapProfileTitle both live at the top centre of the map column.
  // The banner wins, but by the caption stepping aside rather than being covered:
  // the caption is the taller of the two, so layering left a strip of it showing
  // under the banner. Only the wide branch wires this up - the compact and mobile
  // banners have no map caption to displace.
  const [bannerVisible, setBannerVisible] = useState(false);
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // The FAB shows only on the bare feed. Strip any locale prefix (/fr, /de, ...)
  // so a prefixed home still counts as the feed; any child modal route (/add,
  // /p/:id, /settings, ...) leaves a non-'/' remainder and hides it.
  const feedPrefix = localePrefixOf(location.pathname);
  const isFeedRoute = (feedPrefix ? location.pathname.slice(feedPrefix.length) || '/' : location.pathname) === '/';
  // Only /p/:id renders MapProfileTitle, so only that route needs the banner out
  // of the way (see the HotBanner comment below).
  const isProfileRoute = /^\/p\/[^/?#]+/.test(feedPrefix ? location.pathname.slice(feedPrefix.length) : location.pathname);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      window.history.replaceState({}, '', window.location.pathname);
    }
    const billing = params.get('billing');
    if (billing) {
      // After Stripe redirect - webhook may land 1-3s after the browser returns. Refetch a few times.
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (billing === 'success') {
        const t1 = setTimeout(() => queryClient.invalidateQueries({ queryKey: ['me'] }), 2_000);
        const t2 = setTimeout(() => queryClient.invalidateQueries({ queryKey: ['me'] }), 6_000);
        // Best-effort cleanup if the user navigates away
        window.addEventListener('beforeunload', () => { clearTimeout(t1); clearTimeout(t2); }, { once: true });
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);

  const SIDEBAR_INITIAL_LIMIT = 15;
  const SIDEBAR_MAX_LIMIT = 30;
  const [positiveLimit, setPositiveLimit] = useState(SIDEBAR_INITIAL_LIMIT);
  const [negativeLimit, setNegativeLimit] = useState(SIDEBAR_INITIAL_LIMIT);
  const rolesKey = roles.join(',');
  useEffect(() => {
    setPositiveLimit(SIDEBAR_INITIAL_LIMIT);
    setNegativeLimit(SIDEBAR_INITIAL_LIMIT);
  }, [country, rolesKey, fresh, search]);

  const positiveQuery = useProfiles({ type: 'positive', country, roles, fresh, search, limit: positiveLimit });
  const negativeQuery = useProfiles({ type: 'negative', country, roles, fresh, search, limit: negativeLimit });

  // Offline / API-down handling. The service worker replays the last cached
  // feed, so most of the time there is still something to render and only the
  // strip under the header appears. `unreachable` is the harder case - nothing
  // cached - where a spinner would otherwise spin forever (a failed query never
  // produces data) and the feed would claim there are no profiles.
  const online = useOnlineStatus();
  const positiveUnreachable = !positiveQuery.data && (positiveQuery.isError || !online);
  const negativeUnreachable = !negativeQuery.data && (negativeQuery.isError || !online);
  const positiveLoading = !positiveUnreachable && (positiveQuery.isPlaceholderData || !positiveQuery.data);
  const negativeLoading = !negativeUnreachable && (negativeQuery.isPlaceholderData || !negativeQuery.data);

  const expandPositive = useCallback(() => {
    setPositiveLimit((prev) => (prev < SIDEBAR_MAX_LIMIT ? SIDEBAR_MAX_LIMIT : prev));
  }, []);
  const expandNegative = useCallback(() => {
    setNegativeLimit((prev) => (prev < SIDEBAR_MAX_LIMIT ? SIDEBAR_MAX_LIMIT : prev));
  }, []);
  const onLoadMorePositive = isMobile ? undefined : expandPositive;
  const onLoadMoreNegative = isMobile ? undefined : expandNegative;

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
      {/* First line on the page, above the header - see AndroidAppBanner.
          Android browsers only, so it is absent for everyone else. */}
      <AndroidAppBanner />
      <FilterBar onAddProfile={() => navigate('/add' + location.search)} />
      <OfflineBanner />

      {isMobile ? (
        <div className="flex-1 flex flex-col min-h-0">
          <MobileMapPanel />
          <MobileFeed
            positiveProfiles={positiveQuery.data?.profiles ?? []}
            negativeProfiles={negativeQuery.data?.profiles ?? []}
            unreachable={positiveUnreachable && negativeUnreachable}
          />
        </div>
      ) : isCompact ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0">
              <Sidebar
                title={t.trending}
                profiles={positiveQuery.data?.profiles ?? []}
                accentColor="positive"
                onLoadMore={onLoadMorePositive}
                isLoadingMore={positiveLoading}
                unreachable={positiveUnreachable}
              />
            </div>
            <div className="w-px bg-border shrink-0" />
            <div className="flex-1 min-w-0">
              <Sidebar
                title={t.falling}
                profiles={negativeQuery.data?.profiles ?? []}
                accentColor="negative"
                onLoadMore={onLoadMoreNegative}
                isLoadingMore={negativeLoading}
                unreachable={negativeUnreachable}
              />
            </div>
          </div>
          <VoteBanner />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div
            style={{ width: sidebarWidths.left, maxWidth: 'calc(50vw - 250px)' }}
            className="shrink-0 relative z-10 bg-surface/80 backdrop-blur-md"
          >
            <Sidebar
              title={t.trending}
              profiles={positiveQuery.data?.profiles ?? []}
              accentColor="positive"
              onLoadMore={onLoadMorePositive}
              isLoadingMore={positiveLoading}
              unreachable={positiveUnreachable}
            />
          </div>
          <ResizeHandle side="left" onDrag={handleLeftDrag} />
          <div className="flex-1 min-w-0 flex flex-col min-h-0 relative">
            {/* Suppressed on a profile route: the banner sits at top-2 centred
                with w-[min(700px,90vw)], exactly where MapProfileTitle (the page
                h1) renders, and it promotes a different opinio than the one the
                map is currently tinted for. */}
            <HotBanner
              enabled={!isMobile && !isCompact && !isProfileRoute}
              onVisibilityChange={setBannerVisible}
            />
            <Suspense fallback={<div className="flex-1 min-h-0" />}>
              <WorldMap bannerVisible={bannerVisible} />
            </Suspense>
            <VoteBanner />
          </div>
          <ResizeHandle side="right" onDrag={handleRightDrag} />
          <div
            style={{ width: sidebarWidths.right, maxWidth: 'calc(50vw - 250px)' }}
            className="shrink-0 relative z-10 bg-surface/80 backdrop-blur-md"
          >
            <Sidebar
              title={t.falling}
              profiles={negativeQuery.data?.profiles ?? []}
              accentColor="negative"
              onLoadMore={onLoadMoreNegative}
              isLoadingMore={negativeLoading}
              unreachable={negativeUnreachable}
            />
          </div>
        </div>
      )}

      <WelcomeAutoOpen />
      <ViewerModeAutoOpen />

      {/* Add-opinio FAB - mobile only, and only on the bare feed (no modal /
          detail route open). Rendered as a top-level sibling (not inside the
          scrolling feed column) so its backdrop-filter can sample the feed
          behind it, matching the bottom vote banner. Hiding it whenever a
          child route is active keeps it from covering profile/country/user
          detail content (those modals sit below the FAB's z-index). */}
      {isMobile && !meLoading && (
        <AddOpinioFab visible={isFeedRoute} onClick={() => navigate('/add' + location.search)} />
      )}

      {/* Modal routes render here */}
      <Outlet />

      {/* Vote allowance bar - mobile only (desktop renders inside map column).
          HotBanner sits just above it; the container is click-through so taps
          on the feed behind the banner's padding still register. */}
      {isMobile && (
        // z-[90]: votes bar above all modals (ModalShell z-80, detail z-50),
        // which reserve pb-11 so content clears it. Lightbox (z-95) stays on top.
        <div className="fixed bottom-0 left-0 right-0 z-[90] pointer-events-none">
          <HotBanner enabled={isMobile} mobile />
          <div className="pointer-events-auto">
            <VoteBanner />
          </div>
        </div>
      )}
    </div>
  );
}

function AddRoute() {
  const close = useModalClose();
  return <AddProfileModal onClose={close} />;
}

function SettingsRoute() {
  const close = useModalClose();
  return <SettingsModal onClose={close} />;
}

function AboutRoute() {
  const close = useModalClose();
  return <AboutModal onClose={close} />;
}

function PrivacyRoute() {
  const close = useModalClose();
  return <PrivacyModal onClose={close} />;
}

function TermsRoute() {
  const close = useModalClose();
  return <TermsModal onClose={close} />;
}

function StatsRoute() {
  const close = useModalClose();
  const { category } = useParams();
  return <StatsModal category={slugToCategory(category)} onClose={close} />;
}

function SupportRoute() {
  const close = useModalClose();
  return <SupportModal onClose={close} />;
}

// Static entry point for the signed-in user's own profile, which otherwise
// only exists at the runtime-resolved /u/:id. The Android launcher shortcut
// needs a fixed URL, so it points here and this route does the lookup.
// Rendered null (not a spinner) while /api/me is in flight: on a cold
// shortcut launch that gap sits behind the native splash anyway, and a flash
// of sign-in for an already-signed-in user is the worse failure.
function MeRoute() {
  const { data: me, isLoading } = useMe();
  const location = useLocation();
  if (isLoading) return null;
  const user = me?.user;
  if (!user || user.tier === 'anonymous') {
    return <Navigate to={'/sign-in' + location.search} replace />;
  }
  return <Navigate to={`/u/${user.id}` + location.search} replace />;
}

function SignInRoute() {
  const navigate = useNavigate();
  // navigate('/') instead of navigate(-1) so direct visitors from search /
  // shares land on home, not the previous tab in browser history.
  return <SignInModal onClose={() => navigate('/', { replace: true })} />;
}

const VIEWER_MODE_DISMISSED_KEY = 'opinio_viewer_mode_dismissed_v1';
const WELCOME_SEEN_KEY = 'opinio_welcome_seen_v1';

function dismissedKeyFor(userId: string | null | undefined): string {
  return `${VIEWER_MODE_DISMISSED_KEY}:${userId ?? 'none'}`;
}

function welcomeSeen(): boolean {
  try { return localStorage.getItem(WELCOME_SEEN_KEY) === '1'; } catch { return true; }
}

function ViewerModeRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();
  const handleClose = () => {
    sessionStorage.setItem(dismissedKeyFor(me?.user?.id), '1');
    navigate('/' + location.search, { replace: true });
  };
  return <ViewerModeModal onClose={handleClose} />;
}

function ViewerModeAutoOpen() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!me) return;
    if (me.user?.countryCode) return;
    const isAnon = !me.user || me.user.tier === 'anonymous';
    // Anonymous first-time visitors see the Welcome modal first; the country
    // picker waits until they've dismissed it. Signed-in users with no country
    // skip this gate (Welcome wouldn't fire for them anyway).
    if (isAnon && !welcomeSeen()) return;
    if (sessionStorage.getItem(dismissedKeyFor(me.user?.id)) === '1') return;
    if (location.pathname === '/viewer-mode') return;
    if (location.pathname === '/welcome') return;
    navigate('/viewer-mode' + location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, location.pathname]);

  return null;
}

function WelcomeRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClose = () => {
    try { localStorage.setItem(WELCOME_SEEN_KEY, '1'); } catch { /* private mode - degrade silently */ }
    navigate('/' + location.search, { replace: true });
  };
  return <WelcomeModal onClose={handleClose} />;
}

function WelcomeAutoOpen() {
  const { data: me, isLoading } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || !me) return;
    const isAnon = !me.user || me.user.tier === 'anonymous';
    if (!isAnon) return;
    if (welcomeSeen()) return;
    // v1 fires only on the landing page so deeplinks (/p/:id, /u/:id, /c/:code)
    // keep their content; the flag is then never set for those visitors, so it
    // will show on their next plain visit. Acceptable.
    if (location.pathname !== '/') return;
    navigate('/welcome' + location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, me, location.pathname]);

  return null;
}

function ProfileDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { data: profile, isLoading, error } = useProfile(id ?? null);
  const { data: breakdown, isLoading: breakdownLoading } = usePersonBreakdown(id ?? null);
  const notFound = isNotFound(error);

  useEffect(() => {
    if (profile) applyProfileSeo(profile.name, profile.description, profile.id);
    // Unknown id: the worker already serves a 404; don't leave the tab on the
    // last profile's title - mark it as not found.
    else if (notFound) document.title = `Page not found - ${BRAND}`;
  }, [profile, notFound]);

  // Genuine 404 (expired or bad link) - friendly not-found for both platforms.
  if (notFound) {
    return <ProfileNotFoundModal onClose={() => navigate('/' + location.search)} />;
  }

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

  // key={id} forces remount when switching profiles so useAnimatedValue
  // (and friends) reset cleanly instead of animating from the previous
  // profile's like/dislike totals to the new ones.
  return <DesktopProfileModal key={id ?? ''} profileId={id ?? ''} />;
}

function UserDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUser(id ?? null);
  useEffect(() => {
    if (user) applyUserSeo(user.displayName, user.id, user.bio);
  }, [user]);
  return <UserDetailModal userId={id ?? ''} />;
}

function CountryDetailRoute() {
  const { code } = useParams<{ code: string }>();
  const { t, locale } = useI18n();
  const upper = (code ?? '').toUpperCase();
  useEffect(() => {
    if (!upper) return;
    // Unknown code: the worker already serves a 404; don't title the tab with
    // the junk code - mark it as not found instead.
    if (isKnownCountry(upper)) applyCountrySeo(upper, t.seo, locale);
    else document.title = `Page not found - ${BRAND}`;
  }, [upper, t.seo, locale]);
  return <CountryDetailModal countryCode={upper} />;
}

function AppContent() {
  const location = useLocation();
  const { locale, setLocale, t } = useI18n();

  // A non-English URL prefix (/fr, /de, ...) is an entry-point signal: adopt it
  // as the active locale. Internal navigation then drops the prefix (links are
  // bare) and the locale persists as state. Guarded so it doesn't loop.
  const prefix = localePrefixOf(location.pathname);
  useEffect(() => {
    const seg = prefix.slice(1);
    if (seg && seg !== locale) setLocale(seg as Locale);
  }, [prefix, locale, setLocale]);

  // Strip the prefix before route matching so the existing bare route tree
  // handles /fr/about as /about, /de/c/CZ as /c/CZ, etc. The browser URL keeps
  // the prefix; only the matched location is stripped.
  const routedPath = prefix ? location.pathname.slice(prefix.length) || '/' : location.pathname;
  const matchLocation = prefix ? { ...location, pathname: routedPath } : location;

  useEffect(() => {
    // Don't override SEO for profile/user/country pages - their routes handle that
    if (
      !routedPath.startsWith('/p/') &&
      !routedPath.startsWith('/u/') &&
      !routedPath.startsWith('/c/')
    ) {
      applySeo(routedPath, t.seo, prefix);
    }
  }, [routedPath, prefix, t.seo]);

  return (
    <Routes location={matchLocation}>
      <Route path="/" element={<AppLayout />}>
        <Route path="add" element={<AddRoute />} />
        <Route path="settings" element={<SettingsRoute />} />
        <Route path="about" element={<AboutRoute />} />
        <Route path="privacy" element={<PrivacyRoute />} />
        <Route path="terms" element={<TermsRoute />} />
        <Route path="stats" element={<StatsRoute />} />
        <Route path="stats/:category" element={<StatsRoute />} />
        <Route path="support" element={<SupportRoute />} />
        <Route path="me" element={<MeRoute />} />
        <Route path="sign-in" element={<SignInRoute />} />
        <Route path="viewer-mode" element={<ViewerModeRoute />} />
        <Route path="welcome" element={<WelcomeRoute />} />
        <Route path="p/:id" element={<ProfileDetailRoute />} />
        <Route path="u/:id" element={<UserDetailRoute />} />
        <Route path="c/:code" element={<CountryDetailRoute />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <SignInProvider>
          <FilterProvider>
            <MapPanelProvider>
              <AppContent />
            </MapPanelProvider>
          </FilterProvider>
        </SignInProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
