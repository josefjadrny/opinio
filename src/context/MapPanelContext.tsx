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
//   sheetProfileId  - which opinio's sheet is open, if any. The panel tints to it
//                     whenever it is showing, so opening the map over a detail
//                     shows THAT opinio's votes, and moving to another opinio
//                     re-tints rather than leaving the one you just left on
//                     screen. Null hands the panel back to global sentiment.
//   sheetCountryCode - the same fact for an open country sheet, which tints the
//                     panel to how the world voted on that country's opinios.
//
// Two fields rather than one tagged subject, because the two sheets are separate
// components that mount and unmount independently: a single field would need
// them to agree on who clears it, and a country sheet unmounting after a profile
// sheet mounted would blank the wrong subject. They are mutually exclusive by
// routing, and the panel resolves the pair in one place (see MobileMapPanel).
//
// Nothing else travels through here. Whether the map is open is the panel's own
// height, and the caption naming what it shows sits in the panel too, so no flag
// for it can drift out of step with what is on screen.
export interface MapPanelState {
  sheetProfileId: string | null;
  registerSheet: (id: string | null) => void;
  sheetCountryCode: string | null;
  registerCountrySheet: (code: string | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const MapPanelContext = createContext<MapPanelState | null>(null);

export function MapPanelProvider({ children }: { children: ReactNode }) {
  const [sheetProfileId, setSheetProfileId] = useState<string | null>(null);
  const registerSheet = useCallback((id: string | null) => setSheetProfileId(id), []);
  const [sheetCountryCode, setSheetCountryCode] = useState<string | null>(null);
  const registerCountrySheet = useCallback((code: string | null) => setSheetCountryCode(code), []);

  const value = useMemo(
    () => ({ sheetProfileId, registerSheet, sheetCountryCode, registerCountrySheet }),
    [sheetProfileId, registerSheet, sheetCountryCode, registerCountrySheet],
  );
  return <MapPanelContext.Provider value={value}>{children}</MapPanelContext.Provider>;
}
