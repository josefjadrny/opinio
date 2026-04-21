import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { usePersonBreakdown } from '../../hooks/usePersonBreakdown';
import { Avatar } from './Avatar';
import { RoleBadge } from '../common/RoleBadge';
import { CountryFlag } from '../common/CountryFlag';
import { VoteButtons } from '../voting/VoteButtons';
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/' + location.search); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, location.search]);
  const { data: profile, isLoading, isError } = useProfile(profileId);
  const { data: breakdown } = usePersonBreakdown(profileId);

  const close = () => navigate('/' + location.search);

  return (
    <div className="border-t border-border bg-surface/95 backdrop-blur-sm flex flex-col max-h-[52vh]">
      {isLoading && (
        <div className="flex items-center justify-center py-6 text-sm text-white/40">Loading…</div>
      )}
      {isError && (
        <div className="flex items-center justify-center py-6 text-sm text-white/40">Profile not found</div>
      )}
      {profile && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
            <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-10 h-10 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="font-semibold text-white truncate">{profile.name}</span>
                <CountryFlag code={profile.countryCode} />
                <RoleBadge role={profile.role} />
              </div>
            </div>
            <button
              onClick={close}
              className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">{profile.description}</p>

            <VoteButtons key={profile.id} profileId={profile.id} likes={profile.likes} dislikes={profile.dislikes} />

            {breakdown && (breakdown.topLiking.length > 0 || breakdown.topDisliking.length > 0) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-2">▲ Top fans</p>
                  {breakdown.topLiking.map(({ countryCode, count }) => (
                    <div key={countryCode} className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{getCountryFlag(countryCode)}</span>
                      <span className="text-xs text-white/50 flex-1 truncate">{getCountryName(countryCode)}</span>
                      <span className="text-xs text-positive font-medium tabular-nums">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-negative uppercase tracking-wider mb-2">▼ Critics</p>
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

            <p className="text-xs text-white/30 pt-1">
              Reported by @{profile.addedBy} · {formatDate(profile.createdAt)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
