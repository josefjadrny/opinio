// Android visitors are offered the Play build (a TWA over this same site) via a
// slim banner under the header. Everything that decides whether that banner may
// appear lives here, so the component stays presentational.

const PLAY_PACKAGE = 'live.opinio.app';

// The `referrer` payload is handed to the Play Install Referrer API, so an
// install that started here is attributable in Play Console. Play wants it as a
// single URL-encoded query string.
export const PLAY_STORE_URL =
  `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}&referrer=` +
  encodeURIComponent('utm_source=opinio.live&utm_medium=web&utm_campaign=app_banner');

// The user's decision is kept in a cookie rather than localStorage (the pattern
// the rest of the app uses) because it is a stated preference, not UI state -
// see the cookies section of the privacy page, which lists it.
//
// 400 days is the ceiling Chrome clamps cookie lifetime to; asking for longer
// silently gets truncated, so "never again" is really "not for 400 days".
const DISMISS_COOKIE = 'opinio_app_banner_dismissed';
const DISMISS_MAX_AGE_S = 60 * 60 * 24 * 400;

function isDismissed(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${DISMISS_COOKIE}=1`));
}

export function rememberAppBannerDismissed(): void {
  try {
    // Secure is conditional: on http://localhost the browser drops a Secure
    // cookie outright, so dev would never remember the dismissal.
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${DISMISS_COOKIE}=1; path=/; max-age=${DISMISS_MAX_AGE_S}; SameSite=Lax${secure}`;
  } catch {
    // Cookies blocked - the banner comes back next visit. Nothing to recover.
  }
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

// An installed PWA already gives them the app experience; nudging it towards a
// second install is noise. Covers every display mode a manifest can request
// except 'browser', which is the plain-tab case we DO want to catch.
//
// This is also the second line of defence against the Play build itself: the
// TWA is Chrome, so it matches the Android UA test above, and it reports
// display-mode standalone rather than browser.
function isStandalone(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return ['standalone', 'fullscreen', 'minimal-ui'].some(
    (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
  );
}

// Read once per session and cached by the caller: none of these inputs change
// while the tab is open, and re-deciding mid-session would let the banner pop
// back after a dismissal.
//
// Synchronous gates only - isPlayAppInstalled() below is the async one and the
// caller must clear it too before anything renders.
export function shouldOfferAndroidApp(isTwaSession: boolean): boolean {
  if (isTwaSession) return false; // already inside the Play build
  if (!isAndroid()) return false;
  if (isStandalone()) return false;
  return !isDismissed();
}

type RelatedApp = { platform: string; id?: string; url?: string };
type NavigatorWithRelatedApps = Navigator & {
  getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
};

// The authoritative "they already have it" test, and the one gate that does not
// depend on guessing the context we are running in. Chrome answers it from the
// manifest's related_applications entry plus the Digital Asset Links file, so
// it is true both inside the Play build and in a plain Chrome tab on a phone
// that has the app installed - and offering "Install" in either is wrong.
//
// The two synchronous gates stay: this one is Android-Chrome-only (every other
// browser has no such method) and it is the slow path, so it narrows a decision
// the cheap tests have already mostly made.
export async function isPlayAppInstalled(): Promise<boolean> {
  const nav = typeof navigator === 'undefined' ? undefined : (navigator as NavigatorWithRelatedApps);
  if (typeof nav?.getInstalledRelatedApps !== 'function') return false;
  try {
    const apps = await nav.getInstalledRelatedApps();
    return apps.some((app) => app.platform === 'play' && app.id === PLAY_PACKAGE);
  } catch {
    // Non-secure context, or a Chrome that rejects it. Nothing learned, so fall
    // back to what the synchronous gates already decided.
    return false;
  }
}
