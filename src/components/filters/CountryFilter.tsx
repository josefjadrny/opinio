import { useFilters } from '../../context/useFilters';
import { useI18n } from '../../i18n/I18nContext';
import { CountryPicker } from '../common/CountryPicker';

export function CountryFilter() {
  const { country, setCountry } = useFilters();
  const { t } = useI18n();

  return (
    <CountryPicker
      value={country ?? null}
      onChange={setCountry}
      allowClear
      placeholder={t.allCountries}
      buttonClassName="bg-surface-light text-text-primary text-sm rounded-lg border border-border pl-3 pr-9 py-1.5 focus:outline-none focus:border-accent min-w-[9rem] max-w-[11rem]"
      menuClassName="w-52"
    />
  );
}
