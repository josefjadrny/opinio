import { createContext, useState, type ReactNode } from 'react';
import type { Role } from '../types/profile';

export interface FilterState {
  country: string | undefined;
  role: Role | undefined;
  setCountry: (c: string | undefined) => void;
  setRole: (r: Role | undefined) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<string | undefined>();
  const [role, setRole] = useState<Role | undefined>();

  return (
    <FilterContext.Provider value={{ country, role, setCountry, setRole }}>
      {children}
    </FilterContext.Provider>
  );
}
