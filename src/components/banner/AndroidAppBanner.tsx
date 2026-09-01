import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { isTwa } from '../../utils/twa';
import { isPlayAppInstalled, PLAY_STORE_URL, rememberAppBannerDismissed, shouldOfferAndroidApp } from '../../utils/androidApp';

// Held back from first paint on purpose: a promo that is already on screen when
// the page arrives reads as an ad for the thing you just opened. A few seconds
// in, it reads as an offer. It is also what keeps this clear of Google's
// intrusive-interstitial rules - a small, easily dismissed banner that appears
// after the content is usable, never a layer over it.
const REVEAL_DELAY_MS = 4_000;

// Matches the fold transition in index.css; the node has to outlive the
// animation or it would vanish mid-fold.
const FOLD_MS = 360;

// The first-run overlays own the screen on a visitor's first minute - the
// welcome modal, then the country picker. The banner waits them out rather than
// stacking a second ask behind them (they are route-backed, so this is the
// same check FilterBar's HOME_OVERLAY_PATHS makes).
const FIRST_RUN_PATHS = ['/welcome', '/viewer-mode'];

function PlayIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.6 2.3a1 1 0 00-.5.9v17.6a1 1 0 00.5.9l9.3-9.7L3.6 2.3zm10.7 8.1l2.9-3-9.9-5.6 7 8.6zm0 3.2l-7 8.6 9.9-5.6-2.9-3zm4.3-2.3l-2.5-1.4-3.2 3.1 3.2 3.1 2.5-1.4c.9-.5.9-1.9 0-2.4z" />
    </svg>
  );
}

// Slim strip under the header, Android browsers only. In flow rather than
// floating, so it can never sit on top of the map, the votes bar or a sheet -
// the mobile z-order ladder stays exactly as it was.
export function AndroidAppBanner() {
  const { t } = useI18n();
  const location = useLocation();

  // Decided once. Re-running it per render would let a dismissal in one tab
  // resurrect the banner on the next route change in another.
  const [eligible] = useState(() => shouldOfferAndroidApp(isTwa()));
  // null = the installed-app check has not answered yet. It gates the reveal
  // rather than hiding the banner afterwards, so a phone that already has the
  // app never sees an Install button flash by. Fails closed: if the promise
  // never settles, nothing is offered.
  const [alreadyInstalled, setAlreadyInstalled] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const firstRunOpen = FIRST_RUN_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!eligible) return;
    let cancelled = false;
    isPlayAppInstalled().then((installed) => {
      if (!cancelled) setAlreadyInstalled(installed);
    });
    return () => { cancelled = true; };
  }, [eligible]);

  useEffect(() => {
    if (!eligible || alreadyInstalled !== false || mounted || firstRunOpen) return;
    const id = window.setTimeout(() => setMounted(true), REVEAL_DELAY_MS);
    return () => clearTimeout(id);
  }, [eligible, alreadyInstalled, mounted, firstRunOpen]);

  // Mount collapsed, then open on the next frame - flipping the attribute in
  // the same commit as the mount gives the transition nothing to animate from.
  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  if (!eligible || !mounted) return null;

  const close = () => {
    rememberAppBannerDismissed();
    setOpen(false);
    closeTimer.current = window.setTimeout(() => setMounted(false), FOLD_MS);
  };

  return (
    <div className="app-banner shrink-0 border-b border-white/10 bg-white/[0.04]" data-open={open}>
      <div>
        <div className="app-banner-inner flex items-center gap-3 px-3 py-2">
          <img src="/pwa-192x192.png" alt="" width={36} height={36} className="w-9 h-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white/90">{t.appBannerTitle}</p>
            {/* Wraps rather than truncates: the German and Polish strings are the
                longest and a clipped half-sentence sells nothing. */}
            <p className="line-clamp-2 text-xs leading-snug text-white/50">{t.appBannerBody}</p>
          </div>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="shrink-0 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity active:opacity-70"
          >
            <PlayIcon className="w-3.5 h-3.5" />
            {t.appBannerCta}
          </a>
          <button
            type="button"
            onClick={close}
            aria-label={t.appBannerDismiss}
            className="shrink-0 -mr-1 p-1.5 text-white/40 transition-colors hover:text-white/70 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
