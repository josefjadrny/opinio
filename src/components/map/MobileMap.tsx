import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useCountries } from '../../hooks/useCountries';
import { useProfileCountries } from '../../hooks/useProfileCountries';
import { useCountryVoters } from '../../hooks/useCountryVoters';
import { numericToAlpha2 } from '../../utils/countries';
import { CITIES, cityLabel } from '../../utils/cities';
import { useI18n } from '../../i18n/I18nContext';
import { MapLegend } from './MapLegend';
import {
  WIDTH,
  HEIGHT,
  MIN_ZOOM,
  NO_DATA_FILL,
  LABEL_REF_WIDTH,
  MAX_LABEL_SCALE,
  colorForCountry,
  clampTranslate,
  projection,
  pathGenerator,
  buildCityLabelLayout,
  buildBorderPaths,
  computeCountryAnchors,
  BORDER_COLOR,
  COAST_COLOR,
  COAST_OPACITY,
  COAST_WIDTH_PX,
  borderStroke,
  HOVER_BORDER_COLOR,
  HOVER_WIDTH_PX,
  buildSelectionPaths,
  type BorderPaths,
} from './mapShared';
import { CountryLabels } from './CountryLabels';

const GEO_URL = '/topojson/world-110m.json';

// Mobile allows deeper zoom than the desktop map (which caps at 5) so a touch
// user can pull in close on small countries; the pan clamp scales with zoom, so
// pan range grows with it automatically.
const MOBILE_MAX_ZOOM = 10;

// How far the finger may travel and still count as a tap rather than a pan.
// More generous than the desktop map's 4px mouse threshold on purpose: a finger
// leaving the glass rolls, and a thumb reaching across a phone rolls further, so
// a mouse-tight slop turns ordinary taps into pans that go nowhere. Measured
// from the landing point, not accumulated per move - see onPointerMove.
const TAP_SLOP_PX = 10;

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}

// Mobile world map: same projection / sentiment colours / city-label
// decluttering as the desktop WorldMap, and no hover or tooltip (there is no
// pointer to hover with). One finger pans, two pinch-zoom, plus the shared +/-
// control - and a TAP on a country opens it, which is the only way to reach a
// country page from the map on a phone. Lives inside the collapsible
// MobileMapPanel.
//
// The tap has to coexist with the gestures, which is the whole difficulty: every
// pan and pinch also ends in a finger lifting off a country. A gesture is a tap
// only if it never grew a second finger and never travelled more than
// TAP_SLOP_PX from where it landed - see onPointerDown/Move/Up.
// `open` reflects whether the panel is expanded; it drives the 5-min colour
// poll so a collapsed (but still-mounted) map doesn't keep hitting the API.
//
// `profileId` and `countryCode` each switch the tint from global sentiment to
// how each country voted on ONE subject - one opinio, or every opinio about one
// country - which is what the matching sheet mounts it for. These are not the
// same map with different numbers: the global colouring groups opinios by
// profiles.country_code (what an opinio is ABOUT), the subject modes group votes
// by voter country (where the voter IS). Only one of the three fetches ever runs.
//
// `countryCode` also OUTLINES that country, the desktop map's selection marker
// carried over unchanged. It matters more here, not less: this map has no hover,
// no tooltip and no click, so the outline is the only thing on it that says
// which country the sheet below is about - and, with no hover to share the
// treatment with, nothing it could be confused for.
export function MobileMap({
  open = false,
  profileId = null,
  countryCode = null,
}: {
  open?: boolean;
  profileId?: string | null;
  countryCode?: string | null;
}) {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [countries, setCountries] = useState<GeoJSON.Feature[]>([]);
  const [borders, setBorders] = useState<BorderPaths>({ interior: '', coast: '' });
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, tx: 0, ty: 0 });
  const [mapRenderWidth, setMapRenderWidth] = useState(LABEL_REF_WIDTH);
  const labelScale = Math.min(MAX_LABEL_SCALE, Math.max(1, LABEL_REF_WIDTH / mapRenderWidth));
  const svgRef = useRef<SVGSVGElement>(null);

  // Active touch/pen pointers by id (client coords), and the live pinch gesture
  // baseline (finger separation + midpoint) so each move applies an incremental
  // zoom/pan rather than snapping.
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  // The in-flight tap candidate: where the first finger landed, and whether the
  // gesture has since disqualified itself as a tap by moving or by growing a
  // second finger. Null between gestures.
  const tapRef = useRef<{ x: number; y: number; moved: boolean; multi: boolean } | null>(null);

  const { data: countriesData } = useCountries(open && !profileId && !countryCode);
  // Same query key the profile sheet reads for its empty-map check, so the two
  // are one request.
  const { data: profileCountriesData } = useProfileCountries(profileId);
  const { data: countryVotersData } = useCountryVoters(profileId ? null : countryCode);
  const tally = profileId ? profileCountriesData : countryCode ? countryVotersData : countriesData;
  const countryColors = useMemo(() => {
    const map = new Map<string, string>();
    tally?.countries.forEach((c) => map.set(c.code, colorForCountry(c.likes, c.dislikes)));
    return map;
  }, [tally]);

  // The subject country's outline, drawn over the border layer. Same builder as
  // the desktop map, and the zoom dependency matters more here: this map opens at
  // the same scale in a phone-width box, so an even larger share of an island
  // country is below the ring's size floor until the reader pinches in.
  const selectionZoom = Math.round(zoom.scale * 10) / 10;
  const selectedPaths = useMemo(
    () => (countryCode ? buildSelectionPaths(countries, countryCode, selectionZoom) : []),
    [countries, countryCode, selectionZoom],
  );

  // Mobile shows capitals only - fewer dots/labels to place and render.
  const capitals = useMemo(() => CITIES.filter((c) => c.capital), []);
  const countryAnchors = useMemo(() => computeCountryAnchors(countries), [countries]);
  const cityLabelLayout = useMemo(
    () => buildCityLabelLayout(zoom.scale, locale, labelScale, true),
    [zoom.scale, locale, labelScale],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setMapRenderWidth(w);
    });
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topology: Topology) => {
        const col = topology.objects.countries as GeometryCollection;
        const { features } = feature(topology, col) as GeoJSON.FeatureCollection;
        setCountries(features);
        setBorders(buildBorderPaths(topology, col));
      });
  }, []);

  const applyZoom = useCallback((nextScaleFor: (prevScale: number) => number) => {
    setZoom((prev) => {
      const ns = Math.min(MOBILE_MAX_ZOOM, Math.max(MIN_ZOOM, nextScaleFor(prev.scale)));
      const ratio = ns / prev.scale;
      const cx = WIDTH / 2;
      const cy = HEIGHT / 2;
      const { tx, ty } = clampTranslate(cx - ratio * (cx - prev.tx), cy - ratio * (cy - prev.ty), ns);
      return { scale: ns, tx, ty };
    });
  }, []);
  const stepZoom = useCallback((factor: number) => applyZoom((p) => p * factor), [applyZoom]);

  // Convert a client-space delta into SVG user units (the viewBox is WIDTH wide).
  const svgScaleFactors = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return { sx: 1, sy: 1, rect: null };
    return { sx: WIDTH / rect.width, sy: HEIGHT / rect.height, rect };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // A tap starts as a candidate and is disqualified by anything that makes it
    // a gesture instead - see TAP_SLOP_PX and onPointerUp.
    if (pointers.current.size === 0) {
      tapRef.current = { x: e.clientX, y: e.clientY, moved: false, multi: false };
    } else if (tapRef.current) {
      tapRef.current.multi = true;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svgRef.current?.setPointerCapture(e.pointerId);
    pinchRef.current = null; // recompute baseline on the next move
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const prevPos = pointers.current.get(e.pointerId);
    if (!prevPos) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    // Measured from where the finger LANDED, not from the previous move: a slow
    // drag arrives as many small deltas, none of which would ever cross the slop
    // on its own, and the pan would still end in a navigation.
    const tap = tapRef.current;
    if (tap && !tap.moved && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > TAP_SLOP_PX) {
      tap.moved = true;
    }
    if (tap && pts.length >= 2) tap.multi = true;
    const { sx, sy, rect } = svgScaleFactors();
    if (!rect) return;

    if (pts.length === 1) {
      // One finger: pan by this pointer's screen delta.
      pinchRef.current = null;
      const dx = (e.clientX - prevPos.x) * sx;
      const dy = (e.clientY - prevPos.y) * sy;
      setZoom((prev) => {
        const { tx, ty } = clampTranslate(prev.tx + dx, prev.ty + dy, prev.scale);
        return { ...prev, tx, ty };
      });
    } else if (pts.length >= 2) {
      // Two fingers: pinch-zoom anchored at the finger midpoint, plus pan as the
      // midpoint itself translates. Baseline resets whenever a finger is added.
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const base = pinchRef.current;
      if (base && base.dist > 0) {
        const ratioRaw = dist / base.dist;
        const anchorX = ((midX - rect.left) / rect.width) * WIDTH;
        const anchorY = ((midY - rect.top) / rect.height) * HEIGHT;
        const panDx = (midX - base.midX) * sx;
        const panDy = (midY - base.midY) * sy;
        setZoom((prev) => {
          const ns = Math.min(MOBILE_MAX_ZOOM, Math.max(MIN_ZOOM, prev.scale * ratioRaw));
          const ratio = ns / prev.scale;
          const { tx, ty } = clampTranslate(
            anchorX - ratio * (anchorX - prev.tx) + panDx,
            anchorY - ratio * (anchorY - prev.ty) + panDy,
            ns,
          );
          return { scale: ns, tx, ty };
        });
      }
      pinchRef.current = { dist, midX, midY };
    }
  }, [svgScaleFactors]);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    svgRef.current?.releasePointerCapture?.(e.pointerId);
    pinchRef.current = null; // force a fresh baseline for any remaining fingers

    const tap = tapRef.current;
    // Only once the LAST finger is up: lifting one of two during a pinch is not
    // a tap, however still that finger was.
    if (pointers.current.size > 0) return;
    tapRef.current = null;
    if (!tap || tap.moved || tap.multi || e.type === 'pointercancel') return;

    // The country under the finger, found by hit-testing the page rather than
    // reading e.target: the SVG captures the pointer for panning, so every event
    // retargets to the SVG itself and e.target is never the country path. Every
    // layer drawn over the fills (borders, labels, city markers, the caption) is
    // already pointer-events:none, so the topmost hit here IS the country.
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const alpha2 = el?.getAttribute('data-cc');
    if (!alpha2) return;

    // Same contract as the desktop map's click: a map tap is the ONE place that
    // applies the country filter to the feed, so the list behind the sheet is
    // filtered and stays filtered on close. Other ways in (a link, a pasted URL)
    // leave the feed alone.
    const params = new URLSearchParams(location.search);
    params.set('country', alpha2);
    navigate('/c/' + alpha2 + '?' + params.toString());
  }, [navigate, location.search]);

  // Borders strengthen as you zoom in, and start quieter here than on desktop -
  // see borderStroke.
  const border = borderStroke(zoom.scale, true);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'visible',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none', // we handle pan/zoom; stop the page from scrolling
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <g transform={`translate(${zoom.tx},${zoom.ty}) scale(${zoom.scale})`}>
          {countries.map((geo, i) => {
            const id = String((geo as GeoJSON.Feature & { id?: string | number }).id ?? '');
            const alpha2 = numericToAlpha2(id);
            const d = pathGenerator(geo);
            if (!d) return null;
            const baseFill = (alpha2 && countryColors.get(alpha2)) || NO_DATA_FILL;
            return (
              <path
                key={`${id}-${i}`}
                d={d}
                // Country code on the node so the tint is assertable from the DOM
                // (nothing else identifies which path is which country).
                data-cc={alpha2 ?? undefined}
                fill={baseFill}
                // Borders are the layer below, over every fill - see buildBorderPaths.
                style={{ outline: 'none' }}
              />
            );
          })}

          {/* Borders, over every fill. Quieter than the desktop map's at the same
              zoom - the same 800-unit viewBox renders into a phone-width box, so
              the same lines land three times closer together. */}
          <g fill="none" strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: 'none' }}>
            <path
              d={borders.coast}
              stroke={COAST_COLOR}
              strokeOpacity={COAST_OPACITY}
              strokeWidth={COAST_WIDTH_PX}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={borders.interior}
              stroke={BORDER_COLOR}
              strokeOpacity={border.opacity}
              strokeWidth={border.width}
              vectorEffect="non-scaling-stroke"
            />
            {/* The country this panel's sheet is about, in the same outline the
                desktop map uses. This map has no hover at all, so here it is the
                only white outline on screen. */}
            {selectedPaths.map((d, i) => (
              <path key={`sel-${i}`} d={d} stroke={HOVER_BORDER_COLOR} strokeWidth={HOVER_WIDTH_PX} vectorEffect="non-scaling-stroke" />
            ))}
          </g>

          {/* Country names - quiet layer beneath the city markers. */}
          <CountryLabels anchors={countryAnchors} scale={zoom.scale} labelScale={labelScale} locale={locale} />

          {/* City markers - identical reference layer to the desktop map. */}
          <g
            style={{ pointerEvents: 'none' }}
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          >
            {capitals.map((city) => {
              const p = projection(city.coords);
              if (!p) return null;
              const [cx, cy] = p;
              const r = ((city.capital ? 0.95 : 0.65) / zoom.scale) * labelScale;
              const label = cityLabelLayout.get(`${city.code}:${city.name}`);
              return (
                <g key={`${city.code}:${city.name}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={city.capital ? '#aab0c6' : '#8e94ad'}
                    fillOpacity={city.capital ? 0.85 : 0.6}
                  />
                  {label && (
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor={label.anchor}
                      dominantBaseline="central"
                      fontSize={((city.capital ? 7 : 6.2) / zoom.scale) * labelScale}
                      fontWeight={500}
                      fill="#e4e7f1"
                      stroke="#14142a"
                      strokeWidth={(1.4 / zoom.scale) * labelScale}
                      paintOrder="stroke"
                    >
                      {cityLabel(city.name, locale)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <MapLegend />

      {/* Compact +/- control. Pinch is the primary zoom on mobile; these are a
          fallback. A tall slider (desktop) doesn't fit the short panel. */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 rounded-xl bg-surface/80 backdrop-blur-sm ring-1 ring-border p-1.5">
        <button
          onClick={() => stepZoom(1.4)}
          aria-label="Zoom in"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white text-2xl font-bold leading-none"
        >
          +
        </button>
        <button
          onClick={() => stepZoom(1 / 1.4)}
          aria-label="Zoom out"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white text-2xl font-bold leading-none"
        >
          &#8722;
        </button>
      </div>
    </div>
  );
}
