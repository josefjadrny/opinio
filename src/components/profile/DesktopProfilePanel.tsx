import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { usePersonBreakdown } from '../../hooks/usePersonBreakdown';
import { useVote } from '../../hooks/useVote';
import { useMe } from '../../hooks/useMe';
import { useI18n } from '../../i18n/I18nContext';
import { Avatar } from './Avatar';
import { RoleBadge } from '../common/RoleBadge';
import { CountryFlag } from '../common/CountryFlag';
import { getCountryFlag, getCountryName } from '../../utils/countries';
import { formatNumber } from '../../utils/formatNumber';

interface DesktopProfilePanelProps {
  profileId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DesktopProfilePanel({ profileId }: DesktopProfilePanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { data: profile, isLoading, isError } = useProfile(profileId);
  const { data: breakdown } = usePersonBreakdown(profileId);
  const voteMutation = useVote();
  const { data: me } = useMe();

  const hasCountry = me === undefined || !!me.user.countryCode;
  const canLike = hasCountry && (me?.voteAllowance.like.remaining ?? 0) > 0;
  const canDislike = hasCountry && (me?.voteAllowance.dislike.remaining ?? 0) > 0;

  const close = () => navigate('/' + location.search);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, location.search]);

  return (
    <div className="border-t border-border bg-surface/95 backdrop-blur-sm flex flex-col h-96">
      {isLoading && (
        <div className="flex items-center justify-center flex-1 text-sm text-white/40">Loading…</div>
      )}
      {isError && (
        <div className="flex items-center justify-center flex-1 text-sm text-white/40">Profile not found</div>
      )}
      {profile && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
            <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-9 h-9 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-white truncate">{profile.name}</span>
                <CountryFlag code={profile.countryCode} />
                <RoleBadge role={profile.role} />
              </div>
              <p className="text-[11px] text-white/30 mt-0.5">@{profile.addedBy} · {formatDate(profile.createdAt)}</p>
            </div>
            <button onClick={close} className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-4 py-2.5 space-y-2.5">
            <p className="text-sm text-white/70 leading-relaxed">{profile.description}</p>

            {breakdown && (breakdown.topLiking.length > 0 || breakdown.topDisliking.length > 0) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-1.5">▲ Top fans</p>
                  {breakdown.topLiking.map(({ countryCode, count }) => (
                    <div key={countryCode} className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{getCountryFlag(countryCode)}</span>
                      <span className="text-xs text-white/50 flex-1 truncate">{getCountryName(countryCode)}</span>
                      <span className="text-xs text-positive font-medium tabular-nums">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-negative uppercase tracking-wider mb-1.5">▼ Critics</p>
                  {breakdown.topDisliking.map(({ countryCode, count }) => (
                    <div key={countryCode} className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{getCountryFlag(countryCode)}</span>
                      <span className="text-xs text-white/50 flex-1 truncate">{getCountryName(countryCode)}</span>
                      <span className="text-xs text-negative font-medium tabular-nums">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer vote buttons */}
          <div className="flex items-center justify-center gap-4 px-4 py-3 shrink-0 border-t border-border">
            <button
              onClick={() => voteMutation.mutate({ profileId: profile.id, type: 'like' })}
              disabled={!canLike}
              title={!hasCountry ? t.noCountryWarning : undefined}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-base font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-positive/20 text-positive hover:enabled:bg-positive/30"
            >
              <span>▲</span>
              <span>{t.agree}</span>
              <span className="text-sm font-normal opacity-60 tabular-nums">{formatNumber(profile.likes)}</span>
            </button>
            <button
              onClick={() => voteMutation.mutate({ profileId: profile.id, type: 'dislike' })}
              disabled={!canDislike}
              title={!hasCountry ? t.noCountryWarning : undefined}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-base font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-negative/20 text-negative hover:enabled:bg-negative/30"
            >
              <span>▼</span>
              <span>{t.disagree}</span>
              <span className="text-sm font-normal opacity-60 tabular-nums">{formatNumber(profile.dislikes)}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
