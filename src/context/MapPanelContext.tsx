import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// Lets the mobile map panel at the top of the screen and the profile sheet at
// the bottom see each other. They are siblings in App's tree - the panel sits
// above the feed, the sheet comes out of the router Outlet - so the two facts
// travel through context rather than props.
//
// Desktop needs nothing like this: its map is one component away from the modal
// and reads the open opinio straight off the route.
//
// Neither side drives the other. The panel's grab bar opens and closes the map;
// the sheet's chevron folds its own details away. Both states are legal in any
// combination, including both open - map above, details below - which is the
// point of keeping them apart. What IS shared is who is looking at what:
//
//   sheetProfileId - which opinio's sheet is open, if any. The panel tints to it
//                    whenever it is showing, so opening the map over a detail
//                    shows THAT opinio's votes, and moving to another opinio
//                    re-tints rather than leaving the one you just left on
//                    screen. Null hands the panel back to global sentiment.
//   panelOpen      - is the map actually expanded? Published by the panel, read
//                    by the sheet, which names above its details what the map is
//                    showing. The panel's height is the authority; a second flag
//                    would drift from it during the open/close animation.
export interface MapPanelState {
  sheetProfileId: string | null;
  registerSheet: (id: string | null) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MapPanelContext = createContext<MapPanelState | null>(null);

export function MapPanelProvider({ children }: { children: ReactNode }) {
  const [sheetProfileId, setSheetProfileId] = useState<string | null>(null);
  const [panelOpen, setPanelOpenState] = useState(false);

  const registerSheet = useCallback((id: string | null) => setSheetProfileId(id), []);
  const setPanelOpen = useCallback((open: boolean) => setPanelOpenState(open), []);

  const value = useMemo(
    () => ({ sheetProfileId, registerSheet, panelOpen, setPanelOpen }),
    [sheetProfileId, registerSheet, panelOpen, setPanelOpen],
  );
  return <MapPanelContext.Provider value={value}>{children}</MapPanelContext.Provider>;
}
