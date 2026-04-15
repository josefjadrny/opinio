import { useMe } from '../../hooks/useMe';
import { useCountdown } from '../../hooks/useCountdown';

function VoteSlot({ type, remaining, nextAt }: {
  type: 'like' | 'dislike';
  remaining: number;
  nextAt: string | null;
}) {
  const countdown = useCountdown(remaining === 0 ? nextAt : null);
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

  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg ${bgActive} ${color} text-base font-medium`}>
      <span>{arrow}</span>
      <span className="tabular-nums">{remaining}</span>
    </div>
  );
}

export function VoteBanner() {
  const { data: me } = useMe();

  if (!me) return null;

  const { like, dislike } = me.voteAllowance;

  return (
    <div className="flex items-center justify-center gap-4 py-2 border-t border-white/10 bg-surface/80 backdrop-blur-sm text-sm text-white/50">
      <span>votes left</span>
      <VoteSlot type="like" remaining={like.remaining} nextAt={like.nextAt} />
      <VoteSlot type="dislike" remaining={dislike.remaining} nextAt={dislike.nextAt} />
    </div>
  );
}
