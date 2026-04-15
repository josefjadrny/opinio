import { useI18n } from '../../i18n/I18nContext';
import { LANGUAGES, type Locale } from '../../i18n/strings';
import { CountryFilter } from './CountryFilter';
import { RoleFilter } from './RoleFilter';
import { useFilters } from '../../context/useFilters';

interface FilterBarProps {
  onAddProfile: () => void;
}

export function FilterBar({ onAddProfile }: FilterBarProps) {
  const { t, locale, setLocale } = useI18n();
  const { country, role, setCountry, setRole } = useFilters();
  const hasFilters = !!(country || role);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setCountry(undefined); setRole(undefined); }}
          className="flex items-center gap-1.5 mr-2 hover:opacity-80 transition-opacity"
        >
          <img src="/favicon.svg" alt="Opinio" className="w-7 h-7" />
          <h1 className="text-xl font-bold text-accent tracking-tight">{t.appName}</h1>
        </button>
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
      <div className="flex items-center gap-2">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="bg-white/10 text-white text-sm rounded-lg border border-border px-2 py-1.5 focus:outline-none focus:border-accent"
        >
          {Object.entries(LANGUAGES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button
          onClick={onAddProfile}
          className="bg-accent text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-accent/80 transition-colors"
        >
          {t.addProfile}
        </button>
        <button
          disabled
          title={t.loginTooltip}
          className="text-white/50 text-sm font-medium px-4 py-1.5 rounded-lg border border-white/30 cursor-not-allowed"
        >
          {t.login}
        </button>
      </div>
    </div>
  );
}
