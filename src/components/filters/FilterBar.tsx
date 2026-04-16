import { useI18n } from '../../i18n/I18nContext';
import { CountryFilter } from './CountryFilter';
import { RoleFilter } from './RoleFilter';
import { useFilters } from '../../context/useFilters';
import { ProfileMenu } from './ProfileMenu';
import { useMe } from '../../hooks/useMe';

interface FilterBarProps {
  onAddProfile: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function FilterBar({ onAddProfile, onOpenSettings, onOpenAbout }: FilterBarProps) {
  const { t } = useI18n();
  const { isLoading: meLoading } = useMe();
  const { country, role, setCountry, setRole } = useFilters();
  const hasFilters = !!(country || role);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setCountry(undefined); setRole(undefined); }}
          className="flex items-center gap-1.5 mr-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <img src="/favicon.svg" alt="Opinio" className="w-7 h-7" />
          <h1 className="text-xl font-bold text-accent tracking-tight">{t.appName}</h1>
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <CountryFilter />
          <RoleFilter />
          <button
            onClick={() => { setCountry(undefined); setRole(undefined); }}
            disabled={!hasFilters}
            className="text-sm font-medium px-4 py-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-white/30 text-white hover:enabled:border-white/60"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!meLoading && (
          <button
            onClick={onAddProfile}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors border-white/30 text-white hover:border-white/60 hover:bg-white/5"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {t.addProfile}
          </button>
        )}
        <ProfileMenu onOpenSettings={onOpenSettings} onOpenAbout={onOpenAbout} />
      </div>
    </div>
  );
}
