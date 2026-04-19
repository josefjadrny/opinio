import { useRef, useState, useCallback } from 'react';
import { formatNumber } from '../../utils/formatNumber';
import { useVote } from '../../hooks/useVote';
import { useMe } from '../../hooks/useMe';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { useI18n } from '../../i18n/I18nContext';

interface Particle {
  id: number;
  streak: number; // how many rapid clicks in a row
}

interface VoteButtonsProps {
  profileId: string;
  likes: number;
  dislikes: number;
  compact?: boolean;
  showOnly?: 'like' | 'dislike';
  reverseVotes?: boolean;
}

let particleId = 0;
const STREAK_WINDOW_MS = 800; // clicks within this window count as a streak

function useVoteAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const streakRef = useRef(0);
  const lastClickRef = useRef(0);
  const bumpKeyRef = useRef(0);
  const [bumpKey, setBumpKey] = useState(0);

  const trigger = useCallback(() => {
    const now = Date.now();
    if (now - lastClickRef.current < STREAK_WINDOW_MS) {
      streakRef.current += 1;
    } else {
      streakRef.current = 1;
    }
    lastClickRef.current = now;

    const id = ++particleId;
    const streak = streakRef.current;

    setParticles((prev) => [...prev, { id, streak }]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 750);

    // Re-trigger bump animation on every click by changing the key
    bumpKeyRef.current += 1;
    setBumpKey(bumpKeyRef.current);
  }, []);

  return { particles, bumpKey, trigger };
}

export function VoteButtons({ profileId, likes, dislikes, compact, showOnly, reverseVotes }: VoteButtonsProps) {
  const voteMutation = useVote();
  const { data: me } = useMe();
  const { t } = useI18n();
  const animatedLikes = useAnimatedValue(likes);
  const animatedDislikes = useAnimatedValue(dislikes);

  const likeAnim = useVoteAnimation();
  const dislikeAnim = useVoteAnimation();

  const hasCountry = me === undefined || !!me.user.countryCode;
  const canLike = hasCountry && (me?.voteAllowance.like.remaining ?? 0) > 0;
  const canDislike = hasCountry && (me?.voteAllowance.dislike.remaining ?? 0) > 0;

  const handleVote = (type: 'like' | 'dislike') => {
    voteMutation.mutate({ profileId, type });
    if (type === 'like') likeAnim.trigger();
    else dislikeAnim.trigger();
  };

  const btnBase = compact
    ? 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-all'
    : 'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium transition-all';

  const likeBtn = (!showOnly || showOnly === 'like') && (
    <div className="relative">
      {/* Particles */}
      {likeAnim.particles.map((p) => (
        <span
          key={p.id}
          className="vote-particle text-positive"
          style={{
            fontSize: Math.min(0.7 + p.streak * 0.12, 1.3) + 'rem',
            marginBottom: compact ? 2 : 4,
          }}
        >
          {p.streak >= 5 ? '🔥' : p.streak >= 3 ? `+${p.streak}` : '+1'}
        </span>
      ))}
      <button
        key={likeAnim.bumpKey}
        onClick={() => handleVote('like')}
        disabled={!canLike}
        title={!hasCountry ? t.noCountryWarning : undefined}
        className={`vote-bump ${btnBase} ${
          canLike
            ? 'bg-positive/20 text-positive hover:bg-positive/30'
            : 'bg-positive/15 text-positive/60 cursor-not-allowed'
        }`}
      >
        <span>&#9650;&#xFE0E;</span>
        <span className="tabular-nums">{formatNumber(animatedLikes)}</span>
      </button>
    </div>
  );

  const dislikeBtn = (!showOnly || showOnly === 'dislike') && (
    <div className="relative">
      {dislikeAnim.particles.map((p) => (
        <span
          key={p.id}
          className="vote-particle text-negative"
          style={{
            fontSize: Math.min(0.7 + p.streak * 0.12, 1.3) + 'rem',
            marginBottom: compact ? 2 : 4,
          }}
        >
          {p.streak >= 5 ? '💥' : p.streak >= 3 ? `+${p.streak}` : '+1'}
        </span>
      ))}
      <button
        key={dislikeAnim.bumpKey}
        onClick={() => handleVote('dislike')}
        disabled={!canDislike}
        title={!hasCountry ? t.noCountryWarning : undefined}
        className={`vote-bump ${btnBase} ${
          canDislike
            ? 'bg-negative/20 text-negative hover:bg-negative/30'
            : 'bg-negative/15 text-negative/60 cursor-not-allowed'
        }`}
      >
        <span>&#9660;&#xFE0E;</span>
        <span className="tabular-nums">{formatNumber(animatedDislikes)}</span>
      </button>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {reverseVotes ? <>{dislikeBtn}{likeBtn}</> : <>{likeBtn}{dislikeBtn}</>}
    </div>
  );
}
