import type { CountryProfilesResponse } from '../../types/api';
import { getCountryName, getCountryFlag } from '../../utils/countries';
import { useI18n } from '../../i18n/I18nContext';
import { ProfileCard } from '../profile/ProfileCard';

interface CountryTooltipProps {
  countryCode: string;
  data: CountryProfilesResponse | undefined;
  isLoading: boolean;
  position: { x: number; y: number };
}

export function CountryTooltip({ countryCode, data, isLoading, position }: CountryTooltipProps) {
  const { t } = useI18n();
  const tooltipWidth = 320;
  const tooltipHeight = 520;
  const padding = 12;

  let left = position.x + padding;
  let top = position.y + padding;

  if (left + tooltipWidth > window.innerWidth - padding) {
    left = position.x - tooltipWidth - padding;
  }
  if (top + tooltipHeight > window.innerHeight - padding) {
    top = position.y - tooltipHeight - padding;
  }

  // Clamp to viewport so the tooltip is never off-screen regardless of cursor position
  left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
  top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

  return (
    <div
      className="fixed z-50 bg-surface-light border border-border rounded-xl shadow-2xl p-3 pointer-events-none"
      style={{ left, top, width: tooltipWidth, maxHeight: tooltipHeight, overflow: 'auto' }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <span className="text-lg">{getCountryFlag(countryCode)}</span>
        <span className="font-bold text-white">{getCountryName(countryCode)}</span>
      </div>

      {isLoading && (
        <div className="text-center text-text-secondary text-sm py-4">{t.loading}</div>
      )}

      {data && (
        <>
          {data.positive.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-bold text-positive uppercase mb-1.5">{t.trending}</h3>
              <div className="space-y-1">
                {data.positive.map((p) => (
                  <ProfileCard key={p.id} profile={p} variant="tooltip" />
                ))}
              </div>
            </div>
          )}

          {data.negative.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-negative uppercase mb-1.5">{t.falling}</h3>
              <div className="space-y-1">
                {data.negative.map((p) => (
                  <ProfileCard key={p.id} profile={p} variant="tooltip" />
                ))}
              </div>
            </div>
          )}

          {data.positive.length === 0 && data.negative.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-4">{t.noProfiles}</p>
          )}
        </>
      )}
    </div>
  );
}
