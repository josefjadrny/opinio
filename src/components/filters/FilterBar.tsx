import { useI18n } from '../../i18n/I18nContext';
import { LANGUAGES, type Locale } from '../../i18n/strings';
import { CountryFilter } from './CountryFilter';
import { RoleFilter } from './RoleFilter';

interface FilterBarProps {
  onAddProfile: () => void;
}

export function FilterBar({ onAddProfile }: FilterBarProps) {
  const { t, locale, setLocale } = useI18n();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-accent tracking-tight mr-2">{t.appName}</h1>
        <CountryFilter />
        <RoleFilter />
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
          className="bg-white/10 text-white/40 text-sm font-medium px-4 py-1.5 rounded-lg cursor-not-allowed"
        >
          {t.login}
        </button>
      </div>
    </div>
  );
}
