import { useCallback, useState } from 'react';

// One key for both profile modals: collapsing the details is the same reader
// choice on either form factor, and someone who folded them away on the phone
// means it on the desktop too.
const DETAILS_COLLAPSED_KEY = 'opinio_profile_details_collapsed_v1';

// The country modal folds too, and gets its OWN key. It is the same gesture for
// the same reason - get the card out of the way of the map - but not the same
// decision: what folds there is a list of up to 15 opinios, not one opinion's
// description, and wanting the list out of the way says nothing about wanting
// the text out of the way. Sharing a key would have folding a country silently
// fold every opinio you open afterwards.
const COUNTRY_COLLAPSED_KEY = 'opinio_country_details_collapsed_v1';

// Whether the modal's body is folded away, leaving just its header. Persisted,
// so the choice survives moving between subjects and visits; default is
// expanded. The key is what scopes it - see above.
export function useDetailsCollapsed(storageKey: string = DETAILS_COLLAPSED_KEY): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(storageKey) === '1'; } catch { return false; }
  });
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(storageKey, next ? '1' : '0'); } catch { /* private mode */ }
      return next;
    });
  }, [storageKey]);
  return [collapsed, toggle];
}

// The country modal's fold: its opinio list, leaving the header (flag, title,
// vote totals) over an unobstructed map.
export function useCountryDetailsCollapsed(): [boolean, () => void] {
  return useDetailsCollapsed(COUNTRY_COLLAPSED_KEY);
}
