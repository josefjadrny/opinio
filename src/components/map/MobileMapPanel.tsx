import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useMapPanel } from '../../context/useMapPanel';

// Code-split the map so d3-geo + topojson + the city table stay out of the main
// bundle; this chunk is fetched only the first time the panel is opened. NOTE:
// keep this shell free of any import from ./mapShared or ./MobileMap - importing
// even a constant from mapShared would pull d3-geo back into the main chunk.
const MobileMap = lazy(() => import('./MobileMap').then((m) => ({ default: m.MobileMap })));

const HANDLE_H = 44; // grab bar height; also the fully-collapsed panel height
const MAP_ASPECT = 500 / 800; // matches the map SVG viewBox (HEIGHT/WIDTH) so it fills width with no letterboxing
const MAX_VIEWPORT_FRACTION = 0.66; // never let the open panel eat more than this share of the screen

// Collapsible top map panel for mobile (Option A). Starts collapsed: only the
// grab bar shows. Dragging the handle (or tapping it) slowly grows/shrinks the
// map between the collapsed strip and an open height sized to the map's aspect
// ratio (capped to a share of the viewport), snapping to whichever end is nearer
// on release. The map inside is read-only (touch pan / pinch zoom).
export function MobileMapPanel() {
  const { t } = useI18n();
  // Which opinio's sheet is open, if any: the panel tints to it while it is
  // showing, and to global sentiment when nothing is open. Opening or closing
  // the panel is this component's own business - a sheet never moves it, and its
  // chevron folds only the sheet's own details.
  const { sheetProfileId, setPanelOpen } = useMapPanel();
  // Open height = map area sized to the SVG aspect ratio (so it fills the width
  // with no ocean letterboxing) + the grab bar, capped to a share of the screen.
  const expandedH = () =>
    Math.round(
      Math.min(window.innerWidth * MAP_ASPECT, window.innerHeight * MAX_VIEWPORT_FRACTION),
    ) + HANDLE_H;
  const [maxH, setMaxH] = useState(expandedH);
  const [height, setHeight] = useState(HANDLE_H); // collapsed by default
  const [dragging, setDragging] = useState(false);
  // Stays false until the panel is first opened, so a collapsed map never mounts
  // (no topojson fetch, no countries API call, no SVG). Once opened we keep it
  // mounted to avoid re-fetch/flash on subsequent opens.
  const [hasOpened, setHasOpened] = useState(false);
  const dragRef = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (height > HANDLE_H && !hasOpened) setHasOpened(true);
  }, [height, hasOpened]);

  // Publish where the panel ENDS on screen, as a CSS variable, so the profile
  // sheet can hold its backdrop below the map instead of over it. The panel's own
  // height is the wrong number - it sits under the header, so its bottom edge is
  // that height plus whatever is above it, and insetting the sheet by the height
  // alone leaves the grab bar under the backdrop and untappable.
  //
  // A custom property rather than context on purpose: this tracks a 260ms height
  // animation frame by frame, and pushing that through React would re-render the
  // whole open sheet each time for one number in one style rule. The observer is
  // what makes it track: it fires as the animated height changes, so the sheet's
  // edge follows the map's instead of jumping to where it will end up.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        '--mobile-map-panel-bottom',
        `${Math.round(el.getBoundingClientRect().bottom)}px`,
      );
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener('resize', publish);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', publish);
      document.documentElement.style.removeProperty('--mobile-map-panel-bottom');
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const m = expandedH();
      setMaxH(m);
      // Keep an already-open panel matched to the new viewport aspect (e.g. on
      // orientation change) instead of stranding it at the old height.
      setHeight((h) => (h > HANDLE_H ? m : HANDLE_H));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const open = height > HANDLE_H + 4;
  // Publish it so an open profile sheet can name what the map above it is
  // showing. Derived from the height rather than set alongside it, so it can
  // never disagree with what is on screen.
  useEffect(() => { setPanelOpen(open); }, [open, setPanelOpen]);

  // The live height, read by the pointer-up snap without making that callback
  // depend on (and be rebuilt by) every frame of the drag.
  const heightRef = useRef(height);
  heightRef.current = height;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startH: height, moved: false };
    setDragging(true);
  }, [height]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const delta = e.clientY - d.startY;
    if (Math.abs(delta) > 3) d.moved = true;
    const next = Math.max(HANDLE_H, Math.min(maxH, d.startH + delta));
    setHeight(next);
  }, [maxH]);

  const onPointerUp = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!d) return;
    const h = heightRef.current;
    // A tap toggles fully open / collapsed; a drag snaps to whichever end is nearer.
    const target = !d.moved
      ? (h > HANDLE_H + 4 ? HANDLE_H : maxH)
      : (h - HANDLE_H < maxH - h ? HANDLE_H : maxH);
    setHeight(target);
  }, [maxH]);

  return (
    <div
      ref={rootRef}
      className="shrink-0 relative bg-surface border-b border-border overflow-hidden"
      style={{
        height,
        transition: dragging ? 'none' : 'height 260ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Map fills the space above the grab bar; clipped to 0 when collapsed.
          Only mounted after the first open (hasOpened) so a collapsed panel costs
          nothing. Suspense covers the lazily-loaded map chunk. */}
      {hasOpened && (
        <div className="absolute inset-x-0 top-0" style={{ height: Math.max(0, height - HANDLE_H) }}>
          <Suspense fallback={<div className="w-full h-full bg-surface" />}>
            <MobileMap open={open} profileId={sheetProfileId} />
          </Suspense>
        </div>
      )}

      {/* Grab bar pinned to the bottom edge of the panel. */}
      <div
        role="button"
        aria-label={open ? 'Collapse map' : 'Expand map'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 bg-surface/95 backdrop-blur-sm border-t border-border select-none"
        style={{ height: HANDLE_H, cursor: 'ns-resize', touchAction: 'none' }}
      >
        <span className="absolute left-1/2 top-1.5 -translate-x-1/2 w-10 h-1 rounded-full bg-white/25" />
        <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">{t.worldMap}</span>
        <svg
          className="w-4 h-4 text-white/50 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
