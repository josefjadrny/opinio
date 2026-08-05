import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Close handler for the modal routes (/add, /settings, /about, ...).
 *
 * Popping history is the right default - it keeps the feed's scroll position
 * and filters. But a modal route can also be the *first* entry of the session:
 * an Android launcher shortcut into /add, a shared /stats link, a PWA deep
 * link. There is nothing to pop then, so navigate(-1) silently does nothing -
 * and inside the TWA, where there is no browser chrome, that leaves the user
 * trapped in a modal they cannot dismiss.
 *
 * React Router stamps an incrementing `idx` onto history state, so idx 0 means
 * "this app session started here" - fall back to the feed instead.
 */
export function useModalClose() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/' + location.search, { replace: true });
  }, [navigate, location.search]);
}
