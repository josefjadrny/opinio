import { useLayoutEffect, useRef, useState } from 'react';
import type { CountryProfilesResponse } from '../../types/api';
import { getCountryName } from '../../utils/countries';
import { FlagImg } from '../common/CountryFlag';
import { useI18n } from '../../i18n/I18nContext';
import { useCountries } from '../../hooks/useCountries';
import { formatNumber } from '../../utils/formatNumber';
import { ProfileCard } from '../profile/ProfileCard';

interface CountryTooltipProps {
  countryCode: string;
  data: CountryProfilesResponse | undefined;
  isLoading: boolean;
  position: { x: number; y: number };
  // Set while a subject detail is open - one opinio (/p/:id) or one country's
  // opinios (/c/:code). The map is tinted by that subject's votes, so the tooltip
  // switches to the same subject: this country's like/dislike count ON it, and no
  // opinio list (the global list would contradict the tint, which comes from an
  // entirely different query). Which subject it is doesn't change the rendering -
  // the header already names the hovered country, and the counts mean the same
  // thing either way: "this is how this country voted on what the map is about".
  subjectCounts?: { likes: number; dislikes: number } | null;
}

const TOOLTIP_WIDTH = 380;
const TOOLTIP_MAX_HEIGHT = 520;
const PADDING = 12;

export function CountryTooltip({ countryCode, data, isLoading, position, subjectCounts }: CountryTooltipProps) {
  const { t, locale } = useI18n();
  const tipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const subjectMode = subjectCounts !== undefined;
  // Global aggregate is only needed for the default header; skip the lookup in
  // subject mode, where the numbers come from the open opinio or country instead.
  const { data: countriesData } = useCountries();
  const globalCounts = countriesData?.countries.find((c) => c.code === countryCode) ?? { likes: 0, dislikes: 0 };
  const counts = subjectMode ? (subjectCounts ?? { likes: 0, dislikes: 0 }) : globalCounts;

  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;

    let left = position.x + PADDING;
    let top = position.y + PADDING;

    if (left + w > window.innerWidth - PADDING) {
      left = position.x - w - PADDING;
    }
    if (top + h > window.innerHeight - PADDING) {
      top = position.y - h - PADDING;
    }

    left = Math.max(PADDING, Math.min(left, window.innerWidth - w - PADDING));
    top = Math.max(PADDING, Math.min(top, window.innerHeight - h - PADDING));

    setCoords({ left, top });
  }, [position.x, position.y, data, isLoading]);

  return (
    <div
      ref={tipRef}
      className="fixed z-50 bg-surface-light border border-border rounded-xl shadow-2xl p-3 pointer-events-none"
      style={{
        left: coords?.left ?? position.x + PADDING,
        top: coords?.top ?? position.y + PADDING,
        width: TOOLTIP_WIDTH,
        maxHeight: TOOLTIP_MAX_HEIGHT,
        overflow: 'auto',
        visibility: coords ? 'visible' : 'hidden',
      }}
    >
      <div className={`flex items-center gap-2 ${subjectMode ? 'mb-1.5' : 'mb-3 pb-2 border-b border-border'}`}>
        <FlagImg code={countryCode} className="inline-block align-middle shrink-0" />
        <span className="font-bold text-white flex-1 min-w-0 truncate">{getCountryName(countryCode, locale)}</span>
        <div className="shrink-0 flex items-center gap-2 text-sm tabular-nums leading-none">
          <span className="inline-flex items-baseline gap-1 text-positive font-semibold">
            <span className="text-[11px]">▲</span>
            {formatNumber(counts.likes)}
          </span>
          <span className="inline-flex items-baseline gap-1 text-negative font-semibold">
            <span className="text-[11px]">▼</span>
            {formatNumber(counts.dislikes)}
          </span>
        </div>
      </div>

      {subjectMode ? null : (
      <>
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
      </>
      )}
    </div>
  );
}
