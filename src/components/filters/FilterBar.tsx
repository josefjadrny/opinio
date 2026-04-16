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
  const { data: me, isLoading: meLoading } = useMe();
  const isAnonymous = !me?.user || me.user.tier === 'anonymous';
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
            onClick={isAnonymous ? undefined : onAddProfile}
            disabled={isAnonymous}
            title={isAnonymous ? t.nominateTooltip : undefined}
            className={`text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
              isAnonymous
                ? 'bg-accent/30 cursor-not-allowed'
                : 'bg-accent hover:bg-accent/80'
            }`}
          >
            {t.addProfile}
          </button>
        )}
        <ProfileMenu onOpenSettings={onOpenSettings} onOpenAbout={onOpenAbout} />
      </div>
    </div>
  );
}
