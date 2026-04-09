import { useState, useCallback, useRef, useEffect } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useCountryProfiles } from '../../hooks/useCountryProfiles';
import { numericToAlpha2 } from '../../utils/countries';
import { CountryTooltip } from './CountryTooltip';
import { useFilters } from '../../context/useFilters';

const GEO_URL = '/topojson/world-110m.json';
const WIDTH = 800;
const HEIGHT = 500;
const MIN_ZOOM = 1;
const MAX_ZOOM = 1.5;

function clampTranslate(tx: number, ty: number, scale: number) {
  return {
    tx: Math.min(WIDTH * 0.1, Math.max(-(WIDTH * scale - WIDTH * 0.9), tx)),
    ty: Math.min(HEIGHT * 0.1, Math.max(-(HEIGHT * scale - HEIGHT * 0.9), ty)),
  };
}

const projection = geoNaturalEarth1()
  .scale(158)
  .center([10, 20])
  .translate([400, 240]);

const pathGenerator = geoPath(projection);

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}

export function WorldMap() {
  const { country: selectedCountry, setCountry, hoveredProfileCountry } = useFilters();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [countries, setCountries] = useState<GeoJSON.Feature[]>([]);
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, tx: 0, ty: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedCountry, setDebouncedCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  const { data, isLoading } = useCountryProfiles(debouncedCountry);

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

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: zoom.tx, ty: zoom.ty };
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
      setZoom((prev) => {
        const { tx, ty } = clampTranslate(drag.tx + dx, drag.ty + dy, prev.scale);
        return { ...prev, tx, ty };
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleClick = useCallback((alpha2: string) => {
    if (dragRef.current) return; // don't fire click after drag
    setCountry(alpha2 === selectedCountry ? undefined : alpha2);
  }, [selectedCountry, setCountry]);

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
    <div className="relative flex-1 min-h-0 overflow-hidden" onMouseMove={handleMouseMove}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMin meet"
        style={{ width: '100%', height: '100%', display: 'block', cursor: dragRef.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${zoom.tx},${zoom.ty}) scale(${zoom.scale})`}>
          {countries.map((geo, i) => {
            const id = String((geo as GeoJSON.Feature & { id?: string | number }).id ?? '');
            const alpha2 = numericToAlpha2(id);
            const isSelected = selectedCountry !== undefined && alpha2 === selectedCountry;
            const isHovered = !!alpha2 && (alpha2 === hoveredCountry || alpha2 === hoveredProfileCountry);
            const d = pathGenerator(geo);
            if (!d) return null;

            return (
              <path
                key={`${id}-${i}`}
                d={d}
                fill={isSelected || isHovered ? '#e94560' : '#3a3a6a'}
                stroke={isSelected || isHovered ? '#f1f1f1' : '#5a5a8a'}
                strokeWidth={(isSelected || isHovered ? 0.75 : 0.5) / zoom.scale}
                style={{ outline: 'none', cursor: alpha2 ? 'pointer' : 'default' }}
                onMouseEnter={() => alpha2 && handleMouseEnter(alpha2)}
                onMouseLeave={handleMouseLeave}
                onClick={() => alpha2 && handleClick(alpha2)}
              />
            );
          })}
        </g>
      </svg>

      {hoveredCountry && (
        <CountryTooltip
          countryCode={hoveredCountry}
          data={data}
          isLoading={isLoading}
          position={mousePos}
        />
      )}
    </div>
  );
}
