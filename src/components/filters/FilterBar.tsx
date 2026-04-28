import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { CountryFilter } from './CountryFilter';
import { RoleFilter } from './RoleFilter';
import { MobileFilterSheet } from './MobileFilterSheet';
import { useFilters } from '../../context/useFilters';
import { ProfileMenu } from './ProfileMenu';
import { useMe } from '../../hooks/useMe';
import { HeaderButton } from '../ui/HeaderButton';

interface FilterBarProps {
  onAddProfile: () => void;
}

export function FilterBar({ onAddProfile }: FilterBarProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoading: meLoading } = useMe();
  const { country, roles, clearFilters } = useFilters();
  const hasFilters = !!(country || roles.length);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 mr-2 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
          >
            <img src="/favicon.svg" alt="Opinio" className="w-7 h-7" />
            <h1 className="text-xl font-bold text-accent tracking-tight">{t.appName}</h1>
          </button>
          {/* Desktop filters — md+ only */}
          <div className="hidden md:flex items-center gap-3">
            <CountryFilter />
            <RoleFilter />
            <HeaderButton
              onClick={clearFilters}
              disabled={!hasFilters}
              className="text-sm font-medium px-4 py-1.5 text-white whitespace-nowrap"
            >
              {t.clearFilters}
            </HeaderButton>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile filter icon — hidden at md+ */}
          <HeaderButton
            onClick={() => setFilterSheetOpen(true)}
            className="relative md:hidden p-2 text-white"
            aria-label="Filters"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent" />
            )}
          </HeaderButton>
          {!meLoading && (
            <HeaderButton
              onClick={onAddProfile}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 text-white"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path stroke="var(--color-negative)" strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                <path stroke="var(--color-positive)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v6M9 12h6" />
              </svg>
              <span className="hidden lg:inline">{t.addProfile}</span>
            </HeaderButton>
          )}
          <ProfileMenu />
        </div>
      </div>
      {filterSheetOpen && <MobileFilterSheet onClose={() => setFilterSheetOpen(false)} />}
    </>
  );
}
