import { useMatch } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { useCountdown } from '../../hooks/useCountdown';
import { useVote } from '../../hooks/useVote';
import { useI18n } from '../../i18n/I18nContext';

function VoteSlot({ type, remaining, nextAt, voteOnProfileId }: {
  type: 'like' | 'dislike';
  remaining: number;
  nextAt: string | null;
  voteOnProfileId: string | null;
}) {
  const countdown = useCountdown(remaining === 0 ? nextAt : null);
  const voteMutation = useVote();
  const isLike = type === 'like';
  const arrow = isLike ? '▲' : '▼';
  const color = isLike ? 'text-positive' : 'text-negative';
  const bgActive = isLike ? 'bg-positive/15' : 'bg-negative/15';

  if (remaining === 0 && countdown) {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 text-white/40 text-base">
        <span>{arrow}</span>
        <span className="tabular-nums">{countdown}</span>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 text-white/20 text-base">
        <span>{arrow}</span>
        <span>0</span>
      </div>
    );
  }

  const baseClasses = `flex items-center gap-2 px-4 py-1.5 rounded-lg ${bgActive} ${color} text-base font-medium`;

  if (voteOnProfileId) {
    return (
      <button
        type="button"
        onClick={() => voteMutation.mutate({ profileId: voteOnProfileId, type })}
        disabled={voteMutation.isPending}
        className={`${baseClasses} active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
      >
        <span>{arrow}</span>
        <span className="tabular-nums">{remaining}</span>
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      <span>{arrow}</span>
      <span className="tabular-nums">{remaining}</span>
    </div>
  );
}

export function VoteBanner() {
  const { data: me } = useMe();
  const { t } = useI18n();
  const detailMatch = useMatch('/p/:id');
  const detailProfileId = detailMatch?.params.id ?? null;

  if (!me) return null;

  const { like, dislike } = me.voteAllowance;
  const allExhausted = like.remaining === 0 && dislike.remaining === 0;

  return (
    <div className="flex items-center justify-center gap-4 py-2 border-t border-white/10 bg-surface/80 backdrop-blur-sm text-sm text-white/50">
      <span>{allExhausted ? t.nextVote : t.votesLeft}</span>
      <VoteSlot type="like" remaining={like.remaining} nextAt={like.nextAt} voteOnProfileId={detailProfileId} />
      <VoteSlot type="dislike" remaining={dislike.remaining} nextAt={dislike.nextAt} voteOnProfileId={detailProfileId} />
    </div>
  );
}
