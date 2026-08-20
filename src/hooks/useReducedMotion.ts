import { useSyncExternalStore, useCallback } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// True when the OS asks for reduced motion. Callers should drop to an instant
// state change rather than a shortened animation - a fast sweep is still a sweep.
export function useReducedMotion() {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener('change', cb);
    return () => mql.removeEventListener('change', cb);
  }, []);

  const getSnapshot = useCallback(() => window.matchMedia(QUERY).matches, []);

  return useSyncExternalStore(subscribe, getSnapshot);
}
