import { useState, useCallback, useRef } from 'react';
import type { Profile } from '../../types/profile';
import { RoleBadge } from '../common/RoleBadge';
import { CountryFlag } from '../common/CountryFlag';
import { VoteButtons } from '../voting/VoteButtons';
import { NewBadge } from './NewBadge';
import { PersonTooltip } from './PersonTooltip';
import { ProfileDetailModal } from './ProfileDetailModal';
import { usePersonBreakdown } from '../../hooks/usePersonBreakdown';
import { useFilters } from '../../context/useFilters';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Avatar } from './Avatar';

const ONE_HOUR_MS = 3_600_000;

interface ProfileCardProps {
  profile: Profile;
  variant?: 'default' | 'compact' | 'tooltip';
  rank?: number;
  showOnly?: 'like' | 'dislike';
  reverseVotes?: boolean;
}

export function ProfileCard({ profile, variant = 'default', rank, showOnly, reverseVotes }: ProfileCardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isOverTooltip = useRef(false);
  const isMobile = useIsMobile();
  const { data: breakdown, isLoading: breakdownLoading } = usePersonBreakdown(hoveredId ?? (detailOpen ? profile.id : null));
  const { setHoveredProfileCountry, setCountry } = useFilters();

  const isNew = Date.now() - new Date(profile.createdAt).getTime() < ONE_HOUR_MS;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(leaveTimer.current);
    clearTimeout(hoverTimer.current);
    setHoveredProfileCountry(profile.countryCode);
    hoverTimer.current = setTimeout(() => {
      setHoveredId(profile.id);
    }, 500);
  }, [profile.id, profile.countryCode, setHoveredProfileCountry]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setHoveredProfileCountry(undefined);
    leaveTimer.current = setTimeout(() => {
      if (!isOverTooltip.current) setHoveredId(null);
    }, 150);
  }, [setHoveredProfileCountry]);

  const handleTooltipEnter = useCallback(() => {
    isOverTooltip.current = true;
    clearTimeout(leaveTimer.current);
  }, []);

  const handleTooltipLeave = useCallback(() => {
    isOverTooltip.current = false;
    setHoveredId(null);
  }, []);

  const handleFlagClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCountry(profile.countryCode);
  }, [profile.countryCode, setCountry]);

  if (variant === 'tooltip') {
    return (
      <div className="flex items-center gap-2 py-1">
        <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-6 h-6" />
        <span className="text-xs font-medium text-white truncate flex-1">{profile.name}</span>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          compact
          showOnly={showOnly}
          reverseVotes={reverseVotes}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <div
          className="flex items-center gap-3 px-3 py-2 bg-surface-light/50 rounded-lg hover:bg-surface-light transition-colors select-none"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {rank != null && (
            <span className="text-xs font-bold text-text-secondary w-5 text-right shrink-0">
              {rank}
            </span>
          )}
          <div
            className="flex items-center gap-3 flex-1 min-w-0"
            onClick={isMobile ? () => setDetailOpen(true) : undefined}
          >
            <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-8 h-8 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap min-w-0">
                <span className="text-sm font-medium text-white truncate min-w-0 flex-shrink">{profile.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="cursor-pointer" onClick={handleFlagClick}>
                    <CountryFlag code={profile.countryCode} />
                  </span>
                  <RoleBadge role={profile.role} />
                  {isNew && <NewBadge />}
                </div>
              </div>
            </div>
          </div>
          <VoteButtons
            profileId={profile.id}
            likes={profile.likes}
            dislikes={profile.dislikes}
            compact
            showOnly={showOnly}
            reverseVotes={reverseVotes}
          />
          {hoveredId && !isMobile && (
            <PersonTooltip
              profile={profile}
              breakdown={breakdown}
              isLoading={breakdownLoading}
              position={mousePos}
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            />
          )}
        </div>
        {detailOpen && (
          <ProfileDetailModal
            profile={profile}
            breakdown={breakdown}
            isLoading={breakdownLoading}
            onClose={() => setDetailOpen(false)}
          />
        )}
      </>
    );
  }

  // default variant
  return (
    <div
      className="flex items-start gap-2.5 px-2.5 py-2 bg-surface-light/50 rounded-xl hover:bg-surface-light transition-colors select-none"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {rank != null && (
        <span className="text-sm font-bold text-text-secondary w-6 text-right shrink-0 pt-1">
          {rank}
        </span>
      )}
      <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-10 h-10" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap min-w-0">
          <span className="font-semibold text-white truncate min-w-0 flex-shrink">{profile.name}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="cursor-pointer" onClick={handleFlagClick}>
              <CountryFlag code={profile.countryCode} />
            </span>
            <RoleBadge role={profile.role} />
            {isNew && <NewBadge />}
          </div>
        </div>
        <p className="text-[13px] text-text-secondary mb-0.5">{profile.description}</p>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          showOnly={showOnly}
          reverseVotes={reverseVotes}
        />
      </div>
      {hoveredId && (
        <PersonTooltip
          profile={profile}
          breakdown={breakdown}
          isLoading={breakdownLoading}
          position={mousePos}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
        />
      )}
    </div>
  );
}
