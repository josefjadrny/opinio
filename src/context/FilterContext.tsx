import { createContext, useState, type ReactNode } from 'react';
import type { Role } from '../types/profile';

export interface FilterState {
  country: string | undefined;
  role: Role | undefined;
  hoveredProfileCountry: string | undefined;
  setCountry: (c: string | undefined) => void;
  setRole: (r: Role | undefined) => void;
  setHoveredProfileCountry: (c: string | undefined) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<string | undefined>();
  const [role, setRole] = useState<Role | undefined>();
  const [hoveredProfileCountry, setHoveredProfileCountry] = useState<string | undefined>();

  return (
    <FilterContext.Provider value={{ country, role, hoveredProfileCountry, setCountry, setRole, setHoveredProfileCountry }}>
      {children}
    </FilterContext.Provider>
  );
}
