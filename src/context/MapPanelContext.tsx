import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// Lets the mobile profile sheet drive the map panel at the top of the screen.
// The two are siblings in App's tree - the panel sits above the feed, the sheet
// comes out of the router Outlet - so the request travels through context rather
// than props, and neither has to know the other exists.
//
// Desktop needs nothing like this: its map is one component away from the modal
// and reads the open opinio straight off the route.
//
// The two facts are held SEPARATELY and the panel's tint is derived from them:
//
//   mapMode        - is the sheet showing a map instead of its details? A mode
//                    the reader chose, not a property of any one opinio.
//   sheetProfileId - which opinio's sheet is open, if any.
//
// Deriving is what makes moving between opinios work. Storing "the panel is
// showing X" alone and asking `panel === me?` to decide whether the sheet is
// collapsed reads as "map closed" the instant you open a different opinio, so
// the sheet would spring open and the map would sit on the opinio you just left.
export interface MapPanelState {
  // What the panel should tint: the open sheet's opinio while map mode is on,
  // otherwise null for the global map.
  profileId: string | null;
  mapMode: boolean;
  setMapMode: (on: boolean) => void;
  // The opinio whose sheet is open. Also what lets the panel's own grab bar mean
  // the same thing as the sheet's chevron: opening it while a detail is up shows
  // THAT opinio's votes, not the global map.
  sheetProfileId: string | null;
  registerSheet: (id: string | null) => void;
}

// Sticky across opinios, like the desktop collapse: someone who came for the map
// keeps getting it. Kept here rather than in the sheet so both the chevron and
// the panel's grab bar write it through one path.
const MAP_MODE_KEY = 'opinio_profile_map_open_v1';

// eslint-disable-next-line react-refresh/only-export-components
export const MapPanelContext = createContext<MapPanelState | null>(null);

export function MapPanelProvider({ children }: { children: ReactNode }) {
  const [mapMode, setMapModeState] = useState(() => {
    try { return localStorage.getItem(MAP_MODE_KEY) === '1'; } catch { return false; }
  });
  const [sheetProfileId, setSheetProfileId] = useState<string | null>(null);

  const setMapMode = useCallback((on: boolean) => {
    setMapModeState(on);
    try { localStorage.setItem(MAP_MODE_KEY, on ? '1' : '0'); } catch { /* private mode */ }
  }, []);
  const registerSheet = useCallback((id: string | null) => setSheetProfileId(id), []);

  const value = useMemo(
    () => ({
      profileId: mapMode ? sheetProfileId : null,
      mapMode,
      setMapMode,
      sheetProfileId,
      registerSheet,
    }),
    [mapMode, setMapMode, sheetProfileId, registerSheet],
  );
  return <MapPanelContext.Provider value={value}>{children}</MapPanelContext.Provider>;
}
