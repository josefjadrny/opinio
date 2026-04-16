import { useI18n } from '../../i18n/I18nContext';
import { CountryFilter } from './CountryFilter';
import { RoleFilter } from './RoleFilter';
import { useFilters } from '../../context/useFilters';
import { ProfileMenu } from './ProfileMenu';
import { useMe } from '../../hooks/useMe';
import { loginWithGoogle } from '../../api/client';

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
        {!meLoading && isAnonymous && (
          <button
            onClick={loginWithGoogle}
            className="text-white text-sm font-medium px-4 py-1.5 rounded-lg border border-white/30 hover:border-white/60 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t.signIn}
          </button>
        )}
        {!meLoading && !isAnonymous && (
          <button
            onClick={onAddProfile}
            className="bg-accent text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-accent/80 transition-colors"
          >
            {t.addProfile}
          </button>
        )}
        <ProfileMenu onOpenSettings={onOpenSettings} onOpenAbout={onOpenAbout} />
      </div>
    </div>
  );
}
