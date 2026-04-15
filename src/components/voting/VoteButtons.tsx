import { formatNumber } from '../../utils/formatNumber';
import { useVote } from '../../hooks/useVote';
import { useMe } from '../../hooks/useMe';

interface VoteButtonsProps {
  profileId: string;
  likes: number;
  dislikes: number;
  compact?: boolean;
  showOnly?: 'like' | 'dislike';
}

export function VoteButtons({ profileId, likes, dislikes, compact, showOnly }: VoteButtonsProps) {
  const voteMutation = useVote();
  const { data: me } = useMe();

  const canLike = (me?.voteAllowance.like.remaining ?? 0) > 0;
  const canDislike = (me?.voteAllowance.dislike.remaining ?? 0) > 0;

  const handleVote = (type: 'like' | 'dislike') => {
    voteMutation.mutate({ profileId, type });
  };

  const btnBase = compact
    ? 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-all'
    : 'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium transition-all';

  return (
    <div className="flex items-center gap-2">
      {(!showOnly || showOnly === 'like') && (
        <button
          onClick={() => handleVote('like')}
          disabled={!canLike}
          className={`${btnBase} ${
            canLike
              ? 'bg-positive/20 text-positive hover:bg-positive/30'
              : 'bg-positive/15 text-positive/60 cursor-not-allowed'
          }`}
        >
          {/* &#xFE0E; forces text presentation, prevents black emoji rendering */}
          <span>&#9650;&#xFE0E;</span>
          <span className="tabular-nums">{formatNumber(likes)}</span>
        </button>
      )}

      {(!showOnly || showOnly === 'dislike') && (
        <button
          onClick={() => handleVote('dislike')}
          disabled={!canDislike}
          className={`${btnBase} ${
            canDislike
              ? 'bg-negative/20 text-negative hover:bg-negative/30'
              : 'bg-negative/15 text-negative/60 cursor-not-allowed'
          }`}
        >
          <span>&#9660;&#xFE0E;</span>
          <span className="tabular-nums">{formatNumber(dislikes)}</span>
        </button>
      )}
    </div>
  );
}
