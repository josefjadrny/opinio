import { ModalShell } from '../common/ModalShell';
import { CountrySearchList } from '../common/CountryPicker';
import { ALL_ROLES, ROLE_COLORS } from '../../utils/roles';
import { useFilters } from '../../context/useFilters';
import { SearchWhisperer } from './SearchWhisperer';
import { useI18n } from '../../i18n/I18nContext';
import type { Role } from '../../types/profile';

interface MobileFilterSheetProps {
  onClose: () => void;
}

const FilterIcon = () => (
  <svg className="w-5 h-5 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
  </svg>
);

export function MobileFilterSheet({ onClose }: MobileFilterSheetProps) {
  const { t } = useI18n();
  const { country, roles, search, setCountry, toggleRole, clearFilters } = useFilters();

  const hasFilters = !!(country || roles.length || search);

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
          <p className="text-xs font-medium text-white/80 mb-2">{t.country}</p>
          <CountrySearchList
            value={country ?? null}
            onPick={(code) => setCountry(code)}
            allowClear
            listClassName="max-h-40 rounded-lg border border-border"
          />
        </div>

        {/* Roles */}
        <div>
          <p className="text-xs font-medium text-white/80 mb-2">{t.allCategories}</p>
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

        {/* Search — advanced filter with typeahead, kept last */}
        <div>
          <p className="text-xs font-medium text-white/80 mb-2">{t.searchLabel}</p>
          <SearchWhisperer variant="mobile" onSelect={onClose} />
        </div>
      </div>
    </ModalShell>
  );
}
