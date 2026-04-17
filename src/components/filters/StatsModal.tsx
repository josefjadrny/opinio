import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTopVoters } from '../../hooks/useTopVoters';
import { getCountryFlag, getCountryName, ALL_COUNTRIES } from '../../utils/countries';
import type { TopVoter } from '../../types/api';

interface StatsModalProps {
  onClose: () => void;
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function LeaderboardTable({
  title,
  rows,
  valueKey,
  accentClass,
  noDataLabel,
  votesLabel,
}: {
  title: string;
  rows: TopVoter[];
  valueKey: 'totalLikesCast' | 'totalDislikesCast';
  accentClass: string;
  noDataLabel: string;
  votesLabel: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${accentClass}`}>{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-white/30 py-4 text-center">{noDataLabel}</p>
      ) : (
        <div className="space-y-1">
          {rows.map((voter, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-xs text-white/30 w-5 shrink-0 text-right">{i + 1}</span>
              <span className="text-base leading-none shrink-0">
                {voter.countryCode ? getCountryFlag(voter.countryCode) : '🌍'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{voter.displayName}</p>
                {voter.countryCode && (
                  <p className="text-xs text-white/30 truncate">{getCountryName(voter.countryCode)}</p>
                )}
              </div>
              <span className={`text-xs font-medium tabular-nums shrink-0 ${accentClass}`}>
                {(voter[valueKey] ?? 0).toLocaleString()} {votesLabel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsContent({ t }: { t: ReturnType<typeof useI18n>['t'] }) {
  const [country, setCountry] = useState<string>('');
  const { data, isLoading } = useTopVoters(country || undefined);

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Country filter */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.country}</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          <option value="" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>{t.allCountries}</option>
          {ALL_COUNTRIES.map(({ code, name }) => (
            <option key={code} value={code} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
              {getCountryFlag(code)} {name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-white/40 text-center py-6">{t.loading}</p>
      ) : (
        <div className="flex gap-6">
          <LeaderboardTable
            title={t.statsTopLikers}
            rows={data?.topLikers ?? []}
            valueKey="totalLikesCast"
            accentClass="text-positive"
            noDataLabel={t.statsNoData}
            votesLabel={t.statsVotes}
          />
          <LeaderboardTable
            title={t.statsTopDislikers}
            rows={data?.topDislikers ?? []}
            valueKey="totalDislikesCast"
            accentClass="text-negative"
            noDataLabel={t.statsNoData}
            votesLabel={t.statsVotes}
          />
        </div>
      )}
    </div>
  );
}

export function StatsModal({ onClose }: StatsModalProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <h2 className="text-base font-semibold text-white">{t.statsTitle}</h2>
            <CloseButton onClose={onClose} />
          </div>
          <StatsContent t={t} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-start justify-center pt-12 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-white">{t.statsTitle}</h2>
          <CloseButton onClose={onClose} />
        </div>
        <StatsContent t={t} />
      </div>
    </div>
  );
}
