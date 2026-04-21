import { useEffect } from 'react';
import type { Profile } from '../../types/profile';
import type { PersonBreakdownResponse } from '../../types/api';
import { Avatar } from './Avatar';
import { RoleBadge } from '../common/RoleBadge';
import { CountryFlag } from '../common/CountryFlag';
import { VoteButtons } from '../voting/VoteButtons';
import { getCountryFlag, getCountryName } from '../../utils/countries';
import { formatNumber } from '../../utils/formatNumber';

interface ProfileDetailModalProps {
  profile: Profile;
  breakdown: PersonBreakdownResponse | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function ProfileDetailModal({ profile, breakdown, isLoading, onClose }: ProfileDetailModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

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
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-10 h-10" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <CountryFlag code={profile.countryCode} />
                <span className="font-semibold text-white truncate">{profile.name}</span>
              </div>
              <RoleBadge role={profile.role} />
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0 ml-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-white/70 leading-relaxed">{profile.description}</p>
          {profile.addedBy && (
            <p className="text-xs text-white/30">reported by @{profile.addedBy}</p>
          )}

          <VoteButtons key={profile.id} profileId={profile.id} likes={profile.likes} dislikes={profile.dislikes} />

          {isLoading && (
            <p className="text-xs text-white/30 pt-1">Loading...</p>
          )}
          {breakdown && (breakdown.topLiking.length > 0 || breakdown.topDisliking.length > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border">
              <div className="pt-3">
                <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-2">▲ Top fans</p>
                {breakdown.topLiking.map(({ countryCode, count }) => (
                  <div key={countryCode} className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{getCountryFlag(countryCode)}</span>
                    <span className="text-xs text-white/50 flex-1 truncate">{getCountryName(countryCode)}</span>
                    <span className="text-xs text-positive font-medium tabular-nums">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3">
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
        </div>
      </div>
    </div>
  );
}
