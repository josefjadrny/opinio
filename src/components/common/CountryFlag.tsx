import { getCountryFlag, getCountryName } from '../../utils/countries';

export function CountryFlag({ code, showName = false }: { code: string; showName?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1" title={getCountryName(code)}>
      <span className="text-lg">{getCountryFlag(code)}</span>
      {showName && <span className="text-xs text-text-secondary">{getCountryName(code)}</span>}
    </span>
  );
}
