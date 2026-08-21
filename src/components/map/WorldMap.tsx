import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useCountryProfiles } from '../../hooks/useCountryProfiles';
import { useCountries } from '../../hooks/useCountries';
import { useProfileCountries } from '../../hooks/useProfileCountries';
import { useProfile } from '../../hooks/useProfile';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { numericToAlpha2 } from '../../utils/countries';
import { CITIES, cityLabel } from '../../utils/cities';
import { useI18n } from '../../i18n/I18nContext';
import { CountryTooltip } from './CountryTooltip';
import { MapZoomControl } from './MapZoomControl';
import { MapLegend } from './MapLegend';
import { MapProfileTitle } from './MapProfileTitle';
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
  computeCountryAnchors,
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

  // --- Profile tint mode -----------------------------------------------------
  // While a /p/:id route is open the map stops showing global country sentiment
  // and shows how each country voted on THAT opinio. The desktop profile modal is
  // a bottom card over a transparent backdrop, so the map stays visible behind it.
  const routeProfileId = useMemo(() => {
    const m = /^\/p\/([^/?#]+)/.exec(location.pathname);
    return m ? m[1] : null;
  }, [location.pathname]);

  // The caption's close button drops the tint back to global WITHOUT closing the
  // modal - the detail stays open and readable over the world map.
  //
  // Held as the id it applies to, not a boolean, and the effect below only
  // *clears* it. A boolean would still read `true` in the commit where the route
  // changes, so moving straight from a dismissed opinio to another one would
  // paint the new one global for a frame and then sweep a second time; comparing
  // ids is correct on that very first render. The render-phase reset below (the
  // React-documented "adjusting state when a prop changes" pattern, not an
  // effect - an effect here fires a cascading render and eslint says so) covers
  // the case the comparison cannot: leaving and reopening the SAME opinio, which
  // should tint again rather than stay dismissed forever.
  const [dismissedProfileId, setDismissedProfileId] = useState<string | null>(null);
  const [lastRouteProfileId, setLastRouteProfileId] = useState(routeProfileId);
  if (lastRouteProfileId !== routeProfileId) {
    setLastRouteProfileId(routeProfileId);
    if (dismissedProfileId) setDismissedProfileId(null);
  }
  const openProfileId = routeProfileId && routeProfileId !== dismissedProfileId ? routeProfileId : null;

  // In profile mode the tooltip shows this opinio's numbers instead of the
  // country's opinio list, so skip that fetch entirely while a profile is open.
  const { data, isLoading } = useCountryProfiles(openProfileId ? null : debouncedCountry);
  // The desktop map is only mounted when it's on screen, so poll while mounted.
  const { data: countriesData } = useCountries(true);
  const globalColors = useMemo(() => {
    const map = new Map<string, string>();
    countriesData?.countries.forEach((c) => map.set(c.code, colorForCountry(c.likes, c.dislikes)));
    return map;
  }, [countriesData]);

  const { data: profileCountriesData } = useProfileCountries(openProfileId);
  // Shares the ['profile', id, locale] key with the open modal, so this is a
  // cache read, not a second request. Names the opinio the tooltip counts belong to.
  const { data: openProfile } = useProfile(openProfileId);
  const profileColors = useMemo(() => {
    const map = new Map<string, string>();
    profileCountriesData?.countries.forEach((c) => map.set(c.code, colorForCountry(c.likes, c.dislikes)));
    return map;
  }, [profileCountriesData]);

  // Cross-fade. `targetKey` is the colouring we want ('' = global, else profile id).
  // Two gates must both open before colours are painted: the outbound sweep has
  // finished for THIS target, and the target's data has arrived. Until then every
  // country is held at NO_DATA_FILL - which doubles as the fade-out and the loading
  // state, so a slow request just extends the neutral hold rather than revealing a
  // half-coloured map. Both gates are derived during render (no state sync in an
  // effect), and `sweptTo` is compared as a key so a target whose data was already
  // cached - closing the modal, or reopening a profile inside staleTime - still
  // plays the sweep instead of snapping.
  const reducedMotion = useReducedMotion();
  const targetKey = openProfileId ?? '';
  const [sweptTo, setSweptTo] = useState(targetKey);

  useEffect(() => {
    if (sweptTo === targetKey) return;
    const t = setTimeout(() => setSweptTo(targetKey), TINT_FADE_MS + TINT_STAGGER_MS);
    return () => clearTimeout(t);
  }, [targetKey, sweptTo]);

  const targetReady = targetKey === '' ? !!countriesData : !!profileCountriesData;
  const isFading = !((reducedMotion || sweptTo === targetKey) && targetReady);
  const countryColors = targetKey === '' ? globalColors : profileColors;

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
                stroke={isHovered ? '#f1f1f1' : '#5a5a8a'}
                strokeWidth={(isHovered ? 1.1 : 0.5) / zoom.scale}
                style={{
                  outline: 'none',
                  cursor: alpha2 ? 'pointer' : 'default',
                  transition: reducedMotion ? undefined : `fill ${TINT_FADE_MS}ms ease`,
                  transitionDelay: reducedMotion ? undefined : `${tintDelays.get(key) ?? 0}ms`,
                  // Keep the country's own sentiment colour on hover (red/green
                  // mean "unpopular/popular" in the legend, so don't repaint it);
                  // signal selection by brightening it + a thicker white border.
                  filter: isHovered ? 'brightness(1.7)' : undefined,
                }}
                onMouseEnter={() => alpha2 && handleMouseEnter(alpha2)}
                onMouseLeave={handleMouseLeave}
                onClick={() => alpha2 && handleCountryClick(alpha2)}
              />
            );
          })}

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
        profile={openProfileId ? openProfile ?? null : null}
        hasVotes={(profileCountriesData?.countries.length ?? 0) > 0}
        onDismiss={() => setDismissedProfileId(routeProfileId)}
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
          profileCounts={
            openProfileId
              ? profileCountriesData?.countries.find((c) => c.code === hoveredCountry) ?? { likes: 0, dislikes: 0 }
              : undefined
          }
        />
      )}
    </div>
  );
}
