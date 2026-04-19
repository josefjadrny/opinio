import { createPortal } from 'react-dom';
import type { Profile } from '../../types/profile';
import type { PersonBreakdownResponse } from '../../types/api';
import { getCountryFlag, getCountryName } from '../../utils/countries';
import { RoleBadge } from '../common/RoleBadge';
import { Avatar } from './Avatar';
import { formatNumber } from '../../utils/formatNumber';

interface PersonTooltipProps {
  profile: Profile;
  breakdown: PersonBreakdownResponse | undefined;
  isLoading: boolean;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const WIDTH = 280;
const HEIGHT = 420;
const PADDING = 14;

export function PersonTooltip({ profile, breakdown, isLoading, position, onMouseEnter, onMouseLeave }: PersonTooltipProps) {
  let left = position.x + PADDING;
  let top = position.y + PADDING;
  if (left + WIDTH > window.innerWidth) left = position.x - WIDTH - PADDING;
  if (top + HEIGHT > window.innerHeight) top = position.y - HEIGHT - PADDING;
  if (top < 60) top = 60;
  if (left < PADDING) left = PADDING;

  return createPortal(
    <div
      className="fixed z-[9999] bg-surface-light border border-border rounded-xl shadow-2xl overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ left, top, width: WIDTH }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-12 h-12" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="text-sm">{getCountryFlag(profile.countryCode)}</span>
            <span className="font-semibold text-white text-sm truncate">{profile.name}</span>
          </div>
          <RoleBadge role={profile.role} />
        </div>
      </div>

      {/* Description */}
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs text-text-secondary line-clamp-3">{profile.description}</p>
        {profile.addedBy && (
          <p className="text-[10px] text-text-secondary/50 mt-1">reported by @{profile.addedBy}</p>
        )}
      </div>

      {/* Vote totals */}
      <div className="flex gap-3 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-positive text-sm">▲</span>
          <span className="text-sm font-bold text-positive">{formatNumber(profile.likes)}</span>
          <span className="text-xs text-text-secondary">likes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-negative text-sm">▼</span>
          <span className="text-sm font-bold text-negative">{formatNumber(profile.dislikes)}</span>
          <span className="text-xs text-text-secondary">dislikes</span>
        </div>
      </div>

      {/* Country breakdown */}
      {isLoading && (
        <div className="px-3 py-3 text-xs text-text-secondary">Loading...</div>
      )}

      {breakdown && (
        <div className="px-3 py-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
          {/* Top liking */}
          <div>
            <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-1">
              ▲ Top fans
            </p>
            {breakdown.topLiking.map(({ countryCode, count }) => (
              <div key={countryCode} className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">{getCountryFlag(countryCode)}</span>
                <span className="text-[11px] text-text-secondary truncate flex-1">
                  {getCountryName(countryCode)}
                </span>
                <span className="text-[11px] text-positive font-medium tabular-nums">
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>

          {/* Top disliking */}
          <div>
            <p className="text-[10px] font-bold text-negative uppercase tracking-wider mb-1">
              ▼ Critics
            </p>
            {breakdown.topDisliking.map(({ countryCode, count }) => (
              <div key={countryCode} className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">{getCountryFlag(countryCode)}</span>
                <span className="text-[11px] text-text-secondary truncate flex-1">
                  {getCountryName(countryCode)}
                </span>
                <span className="text-[11px] text-negative font-medium tabular-nums">
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
