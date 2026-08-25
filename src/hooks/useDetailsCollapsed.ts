import { useCallback, useState } from 'react';

// One key for both profile modals: collapsing the details is the same reader
// choice on either form factor, and someone who folded them away on the phone
// means it on the desktop too.
const DETAILS_COLLAPSED_KEY = 'opinio_profile_details_collapsed_v1';

// Whether the profile modal's description + content image + country breakdown
// are folded away, leaving header, sentiment bar and votes. Persisted, so the
// choice survives moving between opinios and visits; default is expanded.
export function useDetailsCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(DETAILS_COLLAPSED_KEY) === '1'; } catch { return false; }
  });
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(DETAILS_COLLAPSED_KEY, next ? '1' : '0'); } catch { /* private mode */ }
      return next;
    });
  }, []);
  return [collapsed, toggle];
}
