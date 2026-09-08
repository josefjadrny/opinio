import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useCountryProfiles } from '../../hooks/useCountryProfiles';
import { useCountries } from '../../hooks/useCountries';
import { useProfileCountries } from '../../hooks/useProfileCountries';
import { useCountryVoters } from '../../hooks/useCountryVoters';
import { useProfile } from '../../hooks/useProfile';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { numericToAlpha2, isKnownCountry, getCountryName } from '../../utils/countries';
import { CITIES, cityLabel } from '../../utils/cities';
import { useI18n } from '../../i18n/I18nContext';
import { CountryTooltip } from './CountryTooltip';
import { MapZoomControl } from './MapZoomControl';
import { MapLegend } from './MapLegend';
import { MapProfileTitle, type CaptionSubject } from './MapProfileTitle';
import { useFilters } from '../../context/useFilters';
import {
  WIDTH,
  HEIGHT,
  MIN_ZOOM,
  MAX_ZOOM,
  NO_DATA_FILL,
  TINT_FADE_MS,
  TINT_STAGGER_MS,
  tintDelayForX,
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

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}

export function WorldMap({ bannerVisible = false }: { bannerVisible?: boolean } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useI18n();
  const { hoveredProfileCountry } = useFilters();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [countries, setCountries] = useState<GeoJSON.Feature[]>([]);
  const [borders, setBorders] = useState<BorderPaths>({ interior: '', coast: '' });
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, tx: 0, ty: 0 });
  // Rendered CSS width of the map SVG, tracked so labels can be scaled up on
  // narrow (Full HD and smaller) layouts. Init to the reference width so the
  // first paint uses labelScale = 1 (no oversized flash) until the observer fires.
  const [mapRenderWidth, setMapRenderWidth] = useState(LABEL_REF_WIDTH);
  const labelScale = Math.min(MAX_LABEL_SCALE, Math.max(1, LABEL_REF_WIDTH / mapRenderWidth));
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedCountry, setDebouncedCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  // Track whether the user actually dragged (>4px) so we can suppress the click-to-open
  // behavior after a pan and only treat real clicks as country navigations.
  const didDragRef = useRef(false);

  // --- Subject tint modes ----------------------------------------------------
  // The map has three colourings and one slot to show them in:
  //
  //   global      - every country by the sentiment of the opinios ABOUT it.
  //   /p/:id      - how each country voted on THAT opinio.
  //   /c/:code    - how each country voted on every opinio about THAT country.
  //
  // The last two are the same question ("where did the votes come from") asked of
  // a different subject, which is why they share the tint machinery, the caption,
  // the tooltip treatment and the cross-fade below rather than each having their
  // own. Both detail modals are bottom cards over a transparent backdrop, so the
  // map stays visible behind them.
  const routeProfileId = useMemo(() => {
    const m = /^\/p\/([^/?#]+)/.exec(location.pathname);
    return m ? m[1] : null;
  }, [location.pathname]);
  // An unknown code gets no tint at all: /c/ZZ renders the modal's not-found
  // state, and tinting the world for it would claim data that cannot exist.
  const routeCountryCode = useMemo(() => {
    const m = /^\/c\/([^/?#]+)/.exec(location.pathname);
    const code = m ? m[1].toUpperCase() : null;
    return code && isKnownCountry(code) ? code : null;
  }, [location.pathname]);

  // What the route asks the map to be about, as ONE key - '' for global. The two
  // subject kinds share the key space (and hence the dismissal, the sweep and the
  // caption's crossfade) so moving straight from an opinio to a country, or the
  // reverse, is just another subject change.
  const routeSubject = routeProfileId
    ? `p:${routeProfileId}`
    : routeCountryCode
      ? `c:${routeCountryCode}`
      : '';

  // The caption's close button drops the tint back to global WITHOUT closing the
  // modal - the detail stays open and readable over the world map.
  //
  // Held as the subject it applies to, not a boolean, and the reset below only
  // *clears* it. A boolean would still read `true` in the commit where the route
  // changes, so moving straight from a dismissed subject to another one would
  // paint the new one global for a frame and then sweep a second time; comparing
  // keys is correct on that very first render. The render-phase reset below (the
  // React-documented "adjusting state when a prop changes" pattern, not an
  // effect - an effect here fires a cascading render and eslint says so) covers
  // the case the comparison cannot: leaving and reopening the SAME subject, which
  // should tint again rather than stay dismissed forever.
  const [dismissedSubject, setDismissedSubject] = useState('');
  const [lastRouteSubject, setLastRouteSubject] = useState(routeSubject);
  if (lastRouteSubject !== routeSubject) {
    setLastRouteSubject(routeSubject);
    if (dismissedSubject) setDismissedSubject('');
  }
  const openSubject = routeSubject !== dismissedSubject ? routeSubject : '';
  const openProfileId = openSubject.startsWith('p:') ? routeProfileId : null;
  const openCountryCode = openSubject.startsWith('c:') ? routeCountryCode : null;

  // In either subject mode the tooltip shows the subject's numbers instead of the
  // hovered country's opinio list, so skip that fetch entirely while one is open.
  const { data, isLoading } = useCountryProfiles(openSubject ? null : debouncedCountry);
  // The desktop map is only mounted when it's on screen, so poll while mounted.
  const { data: countriesData } = useCountries(true);
  const globalColors = useMemo(() => {
    const map = new Map<string, string>();
    countriesData?.countries.forEach((c) => map.set(c.code, colorForCountry(c.likes, c.dislikes)));
    return map;
  }, [countriesData]);

  const { data: profileCountriesData } = useProfileCountries(openProfileId);
  const { data: countryVotersData } = useCountryVoters(openCountryCode);
  // Shares the ['profile', id, locale] key with the open modal, so this is a
  // cache read, not a second request. Names the opinio the tooltip counts belong to.
  const { data: openProfile } = useProfile(openProfileId);
  // Whichever voter-side tally is live. The two endpoints return the same shape
  // on purpose, so one memo colours either of them.
  const subjectTally = openCountryCode ? countryVotersData : profileCountriesData;
  const subjectColors = useMemo(() => {
    const map = new Map<string, string>();
    subjectTally?.countries.forEach((c) => map.set(c.code, colorForCountry(c.likes, c.dislikes)));
    return map;
  }, [subjectTally]);

  // Cross-fade. `targetKey` is the colouring we want ('' = global, else the open
  // subject). Two gates must both open before colours are painted: the outbound
  // sweep has finished for THIS target, and the target's data has arrived. Until
  // then every country is held at NO_DATA_FILL - which doubles as the fade-out and
  // the loading state, so a slow request just extends the neutral hold rather than
  // revealing a half-coloured map. Both gates are derived during render (no state
  // sync in an effect), and `sweptTo` is compared as a key so a target whose data
  // was already cached - closing the modal, or reopening a subject inside
  // staleTime - still plays the sweep instead of snapping.
  const reducedMotion = useReducedMotion();
  const targetKey = openSubject;
  const [sweptTo, setSweptTo] = useState(targetKey);

  useEffect(() => {
    if (sweptTo === targetKey) return;
    const t = setTimeout(() => setSweptTo(targetKey), TINT_FADE_MS + TINT_STAGGER_MS);
    return () => clearTimeout(t);
  }, [targetKey, sweptTo]);

  const targetReady = targetKey === '' ? !!countriesData : !!subjectTally;
  const isFading = !((reducedMotion || sweptTo === targetKey) && targetReady);
  const countryColors = targetKey === '' ? globalColors : subjectColors;

  // Per-feature fade delay, precomputed once per geometry load so the sweep costs
  // nothing per render. Keyed by the same `${id}-${i}` used for the path key.
  const tintDelays = useMemo(() => {
    const map = new Map<string, number>();
    countries.forEach((geo, i) => {
      const id = String((geo as GeoJSON.Feature & { id?: string | number }).id ?? '');
      const [cx] = pathGenerator.centroid(geo);
      map.set(`${id}-${i}`, tintDelayForX(cx));
    });
    return map;
  }, [countries]);

  // Label placement + decluttering (see buildCityLabelLayout in mapShared).
  // Recomputed each zoom step / locale / labelScale change.
  const cityLabelLayout = useMemo(
    () => buildCityLabelLayout(zoom.scale, locale, labelScale),
    [zoom.scale, locale, labelScale],
  );
  // Country label anchors (centroid + bbox) - zoom-independent, computed once.
  const countryAnchors = useMemo(() => computeCountryAnchors(countries), [countries]);

  // Track the map's rendered width so labelScale can normalize on-screen label
  // size across resolutions (the flex layout resizes the map independently of
  // the window, e.g. when sidebars reflow), not just on window resize.
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

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * WIDTH;
      const cy = ((e.clientY - rect.top) / rect.height) * HEIGHT;
      setZoom((prev) => {
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.scale * factor));
        const ratio = newScale / prev.scale;
        const { tx, ty } = clampTranslate(
          cx - ratio * (cx - prev.tx),
          cy - ratio * (cy - prev.ty),
          newScale,
        );
        return { scale: newScale, tx, ty };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // Zoom from the slider/buttons, keeping the map's visual center fixed — the
  // viewBox center (WIDTH/2, HEIGHT/2) maps to the screen center under xMidYMid,
  // so we reuse the wheel's anchor math with it. nextScaleFor reads the live
  // previous scale so rapid clicks compound instead of snapping to one step.
  const applyZoom = useCallback((nextScaleFor: (prevScale: number) => number) => {
    setZoom((prev) => {
      const ns = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextScaleFor(prev.scale)));
      const ratio = ns / prev.scale;
      const cx = WIDTH / 2;
      const cy = HEIGHT / 2;
      const { tx, ty } = clampTranslate(cx - ratio * (cx - prev.tx), cy - ratio * (cy - prev.ty), ns);
      return { scale: ns, tx, ty };
    });
  }, []);
  const zoomToScale = useCallback((s: number) => applyZoom(() => s), [applyZoom]);
  const stepZoom = useCallback((factor: number) => applyZoom((p) => p * factor), [applyZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: zoom.tx, ty: zoom.ty };
    didDragRef.current = false;
  }, [zoom.tx, zoom.ty]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    const drag = dragRef.current;
    if (drag) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      const dx = (e.clientX - drag.startX) * scaleX;
      const dy = (e.clientY - drag.startY) * scaleY;
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 4) {
        didDragRef.current = true;
      }
      setZoom((prev) => {
        const { tx, ty } = clampTranslate(drag.tx + dx, drag.ty + dy, prev.scale);
        return { ...prev, tx, ty };
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleCountryClick = useCallback((alpha2: string) => {
    if (didDragRef.current) return;
    // A map click is the ONE place that applies the country filter to the feed:
    // set ?country= so the sidebars filter behind the modal and stay filtered on
    // close. Other ways into the detail (breakdown row, /c/ link, pasted URL)
    // navigate without it and leave the feed untouched.
    const params = new URLSearchParams(location.search);
    params.set('country', alpha2);
    navigate('/c/' + alpha2 + '?' + params.toString());
  }, [navigate, location.search]);

  const handleMouseEnter = useCallback((alpha2: string) => {
    setHoveredCountry(alpha2);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedCountry(alpha2);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(debounceRef.current);
    setHoveredCountry(null);
    setDebouncedCountry(null);
  }, []);

  // Borders strengthen as you zoom in - see borderStroke.
  const border = borderStroke(zoom.scale, false);

  // The hovered country's outline lives in the border layer, not as a stroke on
  // the country itself: a stroke there sits UNDER the borders, which would draw
  // their own line down the middle of it. Two codes can be hovered at once - the
  // pointer's country and the one a sidebar card is pointing at - and both get one.
  const pathsFor = useCallback((codes: Set<string>) => {
    if (!codes.size) return [];
    return countries
      .filter((geo) => {
        const code = numericToAlpha2(String((geo as GeoJSON.Feature & { id?: string | number }).id ?? ''));
        return !!code && codes.has(code);
      })
      .map((geo) => pathGenerator(geo))
      .filter((d): d is string => !!d);
  }, [countries]);

  const hoveredPaths = useMemo(
    () => pathsFor(new Set([hoveredCountry, hoveredProfileCountry].filter(Boolean) as string[])),
    [pathsFor, hoveredCountry, hoveredProfileCountry],
  );

  // What the caption above the map names. A country needs no fetch - the name is
  // local - so its caption is there on the first frame, while an opinio's waits
  // for the profile query and the caption stays global until it lands.
  const captionSubject = useMemo<CaptionSubject | null>(() => {
    if (openCountryCode) {
      return { kind: 'country', key: openSubject, code: openCountryCode, name: getCountryName(openCountryCode, locale) };
    }
    if (openProfileId && openProfile) return { kind: 'profile', key: openSubject, profile: openProfile };
    return null;
  }, [openCountryCode, openProfileId, openProfile, openSubject, locale]);

  // The /c/:code subject country, ringed for as long as the page is about it.
  // Tied to openCountryCode rather than the route, so the caption's X drops the
  // ring together with the tint - both say "the map is about this country", and
  // leaving a ring behind on a global map marks a country for no stated reason.
  //
  // Depends on zoom because the ring skips parts too small to hold one at the
  // current scale (see buildSelectionPaths); rounded to a tenth so a wheel spin
  // doesn't rebuild Canada's polygons on every frame for a threshold that moves
  // by nothing.
  const selectionZoom = Math.round(zoom.scale * 10) / 10;
  const selectedPaths = useMemo(
    () => (openCountryCode ? buildSelectionPaths(countries, openCountryCode, selectionZoom) : []),
    [countries, openCountryCode, selectionZoom],
  );

  return (
    <div className="relative flex-1 min-h-0" onMouseMove={handleMouseMove}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', userSelect: 'none', WebkitUserSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${zoom.tx},${zoom.ty}) scale(${zoom.scale})`}>
          {countries.map((geo, i) => {
            const id = String((geo as GeoJSON.Feature & { id?: string | number }).id ?? '');
            const alpha2 = numericToAlpha2(id);
            const isHovered = !!alpha2 && (alpha2 === hoveredCountry || alpha2 === hoveredProfileCountry);
            const d = pathGenerator(geo);
            if (!d) return null;

            const key = `${id}-${i}`;
            // Mid-fade every country is neutral; otherwise a country we have no
            // numbers for gets NO_DATA_FILL, distinct from the near-tie DEFAULT_FILL
            // that colorForCountry returns for a country that voted but didn't lean.
            const baseFill = isFading
              ? NO_DATA_FILL
              : (alpha2 && countryColors.get(alpha2)) || NO_DATA_FILL;
            return (
              <path
                key={key}
                d={d}
                // Country code on the node so the tint is assertable from the DOM
                // (nothing else identifies which path is which country).
                data-cc={alpha2 ?? undefined}
                fill={baseFill}
                // No stroke here: borders are a layer of their own below, drawn
                // over every fill. That also covers the hairline seams two
                // adjacent fills leave along a shared edge, which is what the
                // old per-country stroke was quietly doing.
                style={{
                  outline: 'none',
                  cursor: alpha2 ? 'pointer' : 'default',
                  transition: reducedMotion ? undefined : `fill ${TINT_FADE_MS}ms ease`,
                  transitionDelay: reducedMotion ? undefined : `${tintDelays.get(key) ?? 0}ms`,
                  // Keep the country's own sentiment colour on hover (red/green
                  // mean "unpopular/popular" in the legend, so don't repaint it);
                  // signal selection by brightening it, and by the white outline
                  // the border layer draws for the hovered country.
                  filter: isHovered ? 'brightness(1.7)' : undefined,
                }}
                onMouseEnter={() => alpha2 && handleMouseEnter(alpha2)}
                onMouseLeave={handleMouseLeave}
                onClick={() => alpha2 && handleCountryClick(alpha2)}
              />
            );
          })}

          {/* Borders, over every fill - see buildBorderPaths for why they are one
              layer and not a stroke per country. pointerEvents none so they never
              swallow a country hover or click. */}
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
            {hoveredPaths.map((d, i) => (
              <path key={i} d={d} stroke={HOVER_BORDER_COLOR} strokeWidth={HOVER_WIDTH_PX} vectorEffect="non-scaling-stroke" />
            ))}
            {/* The /c/:code subject country, in the same outline the hover uses -
                see the note in mapShared for why that is not confusable (hover
                also brightens its fill; this never does). Drawn after the hover
                paths so the selected country's outline survives whole when it is
                also the hovered one. */}
            {selectedPaths.map((d, i) => (
              <path key={`sel-${i}`} d={d} stroke={HOVER_BORDER_COLOR} strokeWidth={HOVER_WIDTH_PX} vectorEffect="non-scaling-stroke" />
            ))}
          </g>

          {/* Country names - quiet layer beneath the city markers. */}
          <CountryLabels anchors={countryAnchors} scale={zoom.scale} labelScale={labelScale} locale={locale} />

          {/* City markers. Non-interactive (pointerEvents none) so hover/click
              still falls through to the country path underneath. Marker + label
              sizes divide by zoom.scale to stay a constant on-screen size, like
              the country strokeWidth above. Muted fills + soft halo so the layer
              reads as a quiet reference, not a glossy overlay. Capitals are a
              touch larger and labelled earlier than secondary cities. */}
          <g
            style={{ pointerEvents: 'none' }}
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          >
            {CITIES.map((city) => {
              const p = projection(city.coords);
              if (!p) return null;
              const [cx, cy] = p;
              const r = ((city.capital ? 0.95 : 0.65) / zoom.scale) * labelScale;
              const label = cityLabelLayout.get(`${city.code}:${city.name}`);
              return (
                <g key={`${city.code}:${city.name}`}>
                  {/* Dot stays muted (fillOpacity) so it reads quiet; the label
                      keeps full opacity + a dark halo so it stays legible. */}
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

      <MapProfileTitle
        subject={captionSubject}
        onDismiss={() => setDismissedSubject(routeSubject)}
        suppressed={bannerVisible}
      />
      <MapLegend />
      <MapZoomControl scale={zoom.scale} min={MIN_ZOOM} max={MAX_ZOOM} onZoom={zoomToScale} onStep={stepZoom} />

      {hoveredCountry && (
        <CountryTooltip
          countryCode={hoveredCountry}
          data={data}
          isLoading={isLoading}
          position={mousePos}
          subjectCounts={
            openSubject
              ? subjectTally?.countries.find((c) => c.code === hoveredCountry) ?? { likes: 0, dislikes: 0 }
              : undefined
          }
        />
      )}
    </div>
  );
}
