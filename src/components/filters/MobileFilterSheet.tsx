import { useState } from 'react';
import { ModalShell } from '../common/ModalShell';
import { ALL_COUNTRIES, getCountryFlag } from '../../utils/countries';
import { ALL_ROLES, ROLE_COLORS } from '../../utils/roles';
import { useFilters } from '../../context/useFilters';
import { useI18n } from '../../i18n/I18nContext';
import type { Role } from '../../types/profile';

interface MobileFilterSheetProps {
  onClose: () => void;
}

const FilterIcon = () => (
  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
  </svg>
);

export function MobileFilterSheet({ onClose }: MobileFilterSheetProps) {
  const { t } = useI18n();
  const { country, roles, setCountry, toggleRole, clearFilters } = useFilters();
  const [query, setQuery] = useState('');

  const filtered = query
    ? ALL_COUNTRIES.filter(c => c.name.toLowerCase().startsWith(query.toLowerCase()))
    : ALL_COUNTRIES;

  const hasFilters = !!(country || roles.length);

  const footer = (
    <div className="flex gap-3">
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex-1 text-sm py-2.5 rounded-lg border border-border text-white/50 hover:text-white/70 hover:border-white/30 transition-colors"
        >
          {t.clearFilters}
        </button>
      )}
      <button
        onClick={onClose}
        className="flex-1 text-sm font-semibold py-2.5 rounded-lg bg-accent text-white hover:opacity-90 transition-opacity"
      >
        Done
      </button>
    </div>
  );

  return (
    <ModalShell onClose={onClose} title="Filters" icon={<FilterIcon />} footer={footer}>
      <div className="px-6 py-4 space-y-5">
        {/* Country */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">{t.country}</p>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to filter…"
            className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 focus:outline-none placeholder:text-white/30 mb-2"
          />
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
            {!query && (
              <button
                onClick={() => setCountry(undefined)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5 ${!country ? 'text-accent' : 'text-white/60'}`}
              >
                {t.allCountries}
              </button>
            )}
            {filtered.map(c => (
              <button
                key={c.code}
                onClick={() => setCountry(country === c.code ? undefined : c.code)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-white/5 ${country === c.code ? 'text-accent' : 'text-white/80'}`}
              >
                <span className="shrink-0">{getCountryFlag(c.code)}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-white/30 text-center">No matches</p>
            )}
          </div>
        </div>

        {/* Roles */}
        <div>
          <p className="text-xs font-medium text-white/50 mb-2">{t.allCategories}</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((r: Role) => {
              const active = roles.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={`${ROLE_COLORS[r]} text-white text-[12px] leading-none font-semibold px-2.5 py-1.5 rounded-full uppercase tracking-wide transition-opacity ${
                    active || roles.length === 0 ? 'opacity-100' : 'opacity-35'
                  }`}
                >
                  {t.roles[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
