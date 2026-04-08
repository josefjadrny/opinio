import { useState, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useCountryProfiles } from '../../hooks/useCountryProfiles';
import { numericToAlpha2 } from '../../utils/countries';
import { CountryTooltip } from './CountryTooltip';
import { useFilters } from '../../context/FilterContext';

const GEO_URL = '/topojson/world-110m.json';

export function WorldMap() {
  const { country: selectedCountry, setCountry } = useFilters();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedCountry, setDebouncedCountry] = useState<string | null>(null);

  const { data, isLoading } = useCountryProfiles(debouncedCountry);

  const handleClick = useCallback((alpha2: string) => {
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden" onMouseMove={handleMouseMove}>
      <ComposableMap
        projectionConfig={{ scale: 158, center: [10, 20], translate: [400, 120] }}
        width={800}
        height={500}
        style={{ width: '100%', height: '100%', display: 'block' }}
        // @ts-ignore
        preserveAspectRatio="xMidYMin meet"
      >
        <ZoomableGroup minZoom={1} maxZoom={1.5}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = numericToAlpha2(String(geo.id));
                const isHovered = alpha2 === hoveredCountry;

                const isSelected = selectedCountry !== undefined && alpha2 === selectedCountry;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => alpha2 && handleMouseEnter(alpha2)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => alpha2 && handleClick(alpha2)}
                    style={{
                      default: {
                        fill: isSelected ? '#e94560' : '#3a3a6a',
                        stroke: isSelected ? '#f1f1f1' : '#5a5a8a',
                        strokeWidth: isSelected ? 0.75 : 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: '#e94560',
                        stroke: '#f1f1f1',
                        strokeWidth: 0.75,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#c73350',
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

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
