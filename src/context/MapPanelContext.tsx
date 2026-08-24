import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// Lets the mobile profile sheet drive the map panel at the top of the screen.
// The two are siblings in App's tree - the panel sits above the feed, the sheet
// comes out of the router Outlet - so the request travels through context rather
// than props, and neither has to know the other exists.
//
// Desktop needs nothing like this: its map is one component away from the modal
// and reads the open opinio straight off the route.
export interface MapPanelState {
  // The opinio the top panel is showing instead of global sentiment, or null for
  // the global map. Also the panel's cue to open itself and to close again.
  profileId: string | null;
  showProfile: (id: string) => void;
  showGlobal: () => void;
  // The opinio whose sheet is currently open, if any. It is what lets the panel's
  // own grab bar mean the same thing as the sheet's chevron: opening the panel
  // while a detail is up shows THAT opinio's votes, not the global map.
  sheetProfileId: string | null;
  registerSheet: (id: string | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MapPanelContext = createContext<MapPanelState | null>(null);

export function MapPanelProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [sheetProfileId, setSheetProfileId] = useState<string | null>(null);
  const showProfile = useCallback((id: string) => setProfileId(id), []);
  const showGlobal = useCallback(() => setProfileId(null), []);
  const registerSheet = useCallback((id: string | null) => setSheetProfileId(id), []);
  const value = useMemo(
    () => ({ profileId, showProfile, showGlobal, sheetProfileId, registerSheet }),
    [profileId, showProfile, showGlobal, sheetProfileId, registerSheet],
  );
  return <MapPanelContext.Provider value={value}>{children}</MapPanelContext.Provider>;
}
