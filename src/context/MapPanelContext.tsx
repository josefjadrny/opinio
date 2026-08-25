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
// Nothing else travels through here. Whether the map is open is the panel's own
// height, and the caption naming what it shows sits in the panel too, so no flag
// for it can drift out of step with what is on screen.
export interface MapPanelState {
  sheetProfileId: string | null;
  registerSheet: (id: string | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MapPanelContext = createContext<MapPanelState | null>(null);

export function MapPanelProvider({ children }: { children: ReactNode }) {
  const [sheetProfileId, setSheetProfileId] = useState<string | null>(null);
  const registerSheet = useCallback((id: string | null) => setSheetProfileId(id), []);

  const value = useMemo(
    () => ({ sheetProfileId, registerSheet }),
    [sheetProfileId, registerSheet],
  );
  return <MapPanelContext.Provider value={value}>{children}</MapPanelContext.Provider>;
}
