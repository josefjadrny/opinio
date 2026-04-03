import { useState, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useCountryProfiles } from '../../hooks/useCountryProfiles';
import { alpha3ToAlpha2 } from '../../utils/countries';
import { CountryTooltip } from './CountryTooltip';

const GEO_URL = '/topojson/world-110m.json';

export function WorldMap() {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedCountry, setDebouncedCountry] = useState<string | null>(null);

  const { data, isLoading } = useCountryProfiles(debouncedCountry);

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
    <div className="relative flex-1 flex items-center justify-center overflow-hidden" onMouseMove={handleMouseMove}>
      <ComposableMap
        projectionConfig={{ scale: 180, center: [0, 15] }}
        width={800}
        height={500}
        className="w-full max-h-full"
        style={{ aspectRatio: '800 / 500' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const alpha3 = geo.properties.ISO_A3 || geo.properties['ISO_A3_EH'];
              const alpha2 = alpha3ToAlpha2(alpha3);
              const isHovered = alpha2 === hoveredCountry;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => alpha2 && handleMouseEnter(alpha2)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: '#3a3a6a',
                      stroke: '#5a5a8a',
                      strokeWidth: 0.5,
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
                      fill: '#e94560',
                      outline: 'none',
                    },
                  }}
                  className={isHovered ? '' : ''}
                />
              );
            })
          }
        </Geographies>
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
