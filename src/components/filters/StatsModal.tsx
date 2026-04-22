import { useState } from 'react';
import { ModalShell } from '../common/ModalShell';
import { useI18n } from '../../i18n/I18nContext';
import { useTopVoters } from '../../hooks/useTopVoters';
import { getCountryFlag, getCountryName, ALL_COUNTRIES } from '../../utils/countries';
import type { TopVoter } from '../../types/api';

interface StatsModalProps {
  onClose: () => void;
}

const StatsIcon = () => (
  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

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
              <span className="text-sm w-5 shrink-0 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-xs text-white/30">{i + 1}</span>}
              </span>
              <span className="text-base leading-none shrink-0">
                {voter.countryCode ? getCountryFlag(voter.countryCode) : '🌍'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">@{voter.displayName}</p>
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
      <p className="text-sm text-white/40 leading-relaxed">{t.statsOverview}</p>
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
        <div className="flex flex-col gap-6">
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

  return (
    <ModalShell onClose={onClose} title={t.statsTitle} icon={<StatsIcon />} maxWidth="max-w-lg">
      <StatsContent t={t} />
    </ModalShell>
  );
}
