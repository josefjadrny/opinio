import { useState, useCallback, useRef } from 'react';
import type { Profile } from '../../types/profile';
import { RoleBadge } from '../common/RoleBadge';
import { CountryFlag } from '../common/CountryFlag';
import { VoteButtons } from '../voting/VoteButtons';
import { NewBadge } from './NewBadge';
import { PersonTooltip } from './PersonTooltip';
import { usePersonBreakdown } from '../../hooks/usePersonBreakdown';

interface ProfileCardProps {
  profile: Profile;
  variant?: 'default' | 'compact' | 'tooltip';
  isNew?: boolean;
  rank?: number;
  showOnly?: 'like' | 'dislike';
}

export function ProfileCard({ profile, variant = 'default', isNew, rank, showOnly }: ProfileCardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isOverTooltip = useRef(false);
  const { data: breakdown, isLoading: breakdownLoading } = usePersonBreakdown(hoveredId);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(leaveTimer.current);
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoveredId(profile.id);
    }, 350);
  }, [profile.id]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    leaveTimer.current = setTimeout(() => {
      if (!isOverTooltip.current) setHoveredId(null);
    }, 150);
  }, []);

  const handleTooltipEnter = useCallback(() => {
    isOverTooltip.current = true;
    clearTimeout(leaveTimer.current);
  }, []);

  const handleTooltipLeave = useCallback(() => {
    isOverTooltip.current = false;
    setHoveredId(null);
  }, []);
  if (variant === 'tooltip') {
    return (
      <div className="flex items-center gap-2 py-1">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-6 h-6 rounded-full object-cover shrink-0"
        />
        <span className="text-xs font-medium text-white truncate flex-1">{profile.name}</span>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          myVote={profile.myVote}
          compact
          showOnly={showOnly}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 bg-surface-light/50 rounded-lg hover:bg-surface-light transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {rank != null && (
          <span className="text-xs font-bold text-text-secondary w-5 text-right shrink-0">
            {rank}
          </span>
        )}
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CountryFlag code={profile.countryCode} />
            <span className="text-sm font-medium text-white truncate">{profile.name}</span>
            <RoleBadge role={profile.role} />
            {isNew && <NewBadge />}
          </div>
        </div>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          myVote={profile.myVote}
          compact
          showOnly={showOnly}
        />
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

  // default variant
  return (
    <div
      className="flex items-start gap-3 p-3 bg-surface-light/50 rounded-xl hover:bg-surface-light transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {rank != null && (
        <span className="text-sm font-bold text-text-secondary w-6 text-right shrink-0 pt-1">
          {rank}
        </span>
      )}
      <img
        src={profile.imageUrl}
        alt={profile.name}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <CountryFlag code={profile.countryCode} />
          <span className="font-semibold text-white truncate">{profile.name}</span>
          <RoleBadge role={profile.role} />
          {isNew && <NewBadge />}
        </div>
        <p className="text-xs text-text-secondary line-clamp-2 mb-1">{profile.description}</p>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          myVote={profile.myVote}
          showOnly={showOnly}
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
