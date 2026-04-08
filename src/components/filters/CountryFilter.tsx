import { ALL_COUNTRIES } from '../../utils/countries';
import { useFilters } from '../../context/useFilters';
import { useI18n } from '../../i18n/I18nContext';

export function CountryFilter() {
  const { country, setCountry } = useFilters();
  const { t } = useI18n();

  return (
    <select
      value={country ?? ''}
      onChange={(e) => setCountry(e.target.value || undefined)}
      className="bg-surface-light text-text-primary text-sm rounded-lg border border-border px-3 py-1.5 focus:outline-none focus:border-accent"
    >
      <option value="">{t.allCountries}</option>
      {ALL_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
}
