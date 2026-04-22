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

interface DesktopProfileModalProps {
  profileId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DesktopProfileModal({ profileId }: DesktopProfileModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { data: profile, isLoading } = useProfile(profileId);
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="bg-surface-light border border-border rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-4 flex flex-col max-h-[calc(100dvh-10rem)] mb-16 overflow-hidden pointer-events-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-white/40">Loading…</div>
        )}

        {profile && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
              <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-11 h-11 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="font-semibold text-white truncate">{profile.name}</span>
                  <CountryFlag code={profile.countryCode} />
                  <RoleBadge role={profile.role} />
                </div>
                <p className="text-[11px] text-white/30">@{profile.addedBy} · {formatDate(profile.createdAt)}</p>
              </div>
              <button onClick={close} className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body — two columns */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                {/* Left: description */}
                <div className="px-6 py-4">
                  <p className="text-sm text-white/70 leading-relaxed">{profile.description}</p>
                </div>

                {/* Right: breakdown */}
                <div className="px-6 py-4">
                  {breakdown && (breakdown.topLiking.length > 0 || breakdown.topDisliking.length > 0) ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-2">▲ Top fans</p>
                        {breakdown.topLiking.map(({ countryCode, count }) => (
                          <div key={countryCode} className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">{getCountryFlag(countryCode)}</span>
                            <span className="text-xs text-white/50 flex-1 truncate">{getCountryName(countryCode)}</span>
                            <span className="text-xs text-positive font-medium tabular-nums">{formatNumber(count)}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-negative uppercase tracking-wider mb-2">▼ Critics</p>
                        {breakdown.topDisliking.map(({ countryCode, count }) => (
                          <div key={countryCode} className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">{getCountryFlag(countryCode)}</span>
                            <span className="text-xs text-white/50 flex-1 truncate">{getCountryName(countryCode)}</span>
                            <span className="text-xs text-negative font-medium tabular-nums">{formatNumber(count)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/20">No votes yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer — full-width vote buttons */}
            <div className="flex shrink-0 border-t border-border rounded-none">
              <button
                onClick={() => voteMutation.mutate({ profileId: profile.id, type: 'like' })}
                disabled={!canLike}
                title={!hasCountry ? t.noCountryWarning : undefined}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 text-base font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-positive/10 hover:enabled:bg-positive/20 text-positive border-r border-border rounded-none"
              >
                <span>▲</span>
                <span>{t.agree}</span>
                <span className="text-sm font-normal opacity-60 tabular-nums">{formatNumber(profile.likes)}</span>
              </button>
              <button
                onClick={() => voteMutation.mutate({ profileId: profile.id, type: 'dislike' })}
                disabled={!canDislike}
                title={!hasCountry ? t.noCountryWarning : undefined}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 text-base font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-negative/10 hover:enabled:bg-negative/20 text-negative rounded-none"
              >
                <span>▼</span>
                <span>{t.disagree}</span>
                <span className="text-sm font-normal opacity-60 tabular-nums">{formatNumber(profile.dislikes)}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
