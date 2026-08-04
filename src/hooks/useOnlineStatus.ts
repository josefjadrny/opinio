import { useSyncExternalStore } from 'react';

// Connectivity flag for the whole app. Drives the offline strip, the offline
// empty state and the vote-button gate, so the installed app (Android TWA)
// explains itself instead of showing an empty feed when the phone drops off
// the network. navigator.onLine only proves a network interface exists - a
// captive portal still reports true - so treat it as a hint: the service
// worker replays the last cached feed either way.
function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  // The online/offline events are not enough on Android. When the app is
  // backgrounded Chrome freezes the tab, and a connectivity change while it is
  // frozen never reaches the page - it comes back showing stale chrome (seen
  // on-device: dropped to airplane mode in the background, returned, no offline
  // strip). Re-reading the flag whenever the page becomes visible again covers
  // that, and pageshow covers a restore from the back/forward cache.
  document.addEventListener('visibilitychange', onChange);
  window.addEventListener('pageshow', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
    document.removeEventListener('visibilitychange', onChange);
    window.removeEventListener('pageshow', onChange);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // SSR/prerender: never render the offline chrome into the shell
  );
}
