import { useState } from 'react';
import { useMatch } from 'react-router-dom';
import { useMe } from '../../hooks/useMe';
import { useCountdown } from '../../hooks/useCountdown';
import { useVote } from '../../hooks/useVote';
import { useVoteAnimation } from '../../hooks/useVoteAnimation';
import { useSignIn } from '../auth/SignInContext';
import { useI18n } from '../../i18n/I18nContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const VOTE_WINDOW_MS = 3600 * 1000;

// Anonymous-only nudge: once they've spent both vote pools, a gentle strip
// offers sign-up for more votes. Dismissed permanently per-browser via the x;
// it also vanishes the instant they sign in (tier flips off 'anonymous').
const TEASER_DISMISSED_KEY = 'opinio_votes_teaser_dismissed_v1';
function teaserDismissed(): boolean {
  try { return localStorage.getItem(TEASER_DISMISSED_KEY) === '1'; } catch { return true; }
}

function VoteSlot({ type, remaining, nextAt, voteOnProfileId }: {
  type: 'like' | 'dislike';
  remaining: number;
  nextAt: string | null;
  voteOnProfileId: string | null;
}) {
  const { text: countdown, remainingMs } = useCountdown(remaining === 0 ? nextAt : null);
  const { t } = useI18n();
  const online = useOnlineStatus();
  const voteMutation = useVote();
  const anim = useVoteAnimation();
  const isLike = type === 'like';
  const arrow = isLike ? '▲' : '▼';
  const color = isLike ? 'text-positive' : 'text-negative';
  const bgActive = isLike ? 'bg-positive/15' : 'bg-negative/15';
  const baseClasses = `flex items-center gap-2 px-4 py-1.5 rounded-lg text-base font-medium`;

  const progress = remainingMs !== null ? Math.max(0, Math.min(1, 1 - remainingMs / VOTE_WINDOW_MS)) : 0;
  const progressBg = isLike ? 'rgba(34,197,94,0.12)' : 'rgba(233,69,96,0.12)';

  // Wrapper is always rendered so the particles span survives the
  // remaining=0 transition right after a successful vote — otherwise the
  // ` +1` would unmount before its 750ms float-up animation finishes.
  let body;
  if (remaining === 0 && countdown) {
    body = (
      <div className={`relative overflow-hidden rounded-lg ${baseClasses} bg-white/5 text-white/40`}>
        <div
          className="absolute inset-0 origin-left"
          style={{ backgroundColor: progressBg, transform: `scaleX(${progress})` }}
        />
        <span className="relative">{arrow}</span>
        <span className="relative tabular-nums">{countdown}</span>
      </div>
    );
  } else if (remaining === 0) {
    body = (
      <div className={`${baseClasses} bg-white/5 text-white/20`}>
        <span>{arrow}</span>
        <span>0</span>
      </div>
    );
  } else if (voteOnProfileId) {
    body = (
      <button
        key={anim.bumpKey}
        type="button"
        onClick={() => {
          voteMutation.mutate({ profileId: voteOnProfileId, type });
          anim.trigger();
        }}
        disabled={voteMutation.isPending || !online}
        title={!online ? t.offlineVote : undefined}
        className={`vote-bump ${baseClasses} ${bgActive} ${color} active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
      >
        <span>{arrow}</span>
        <span className="tabular-nums">{remaining}</span>
      </button>
    );
  } else {
    body = (
      <div className={`${baseClasses} ${bgActive} ${color}`}>
        <span>{arrow}</span>
        <span className="tabular-nums">{remaining}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {anim.particles.map((p) => (
        <span
          key={p.id}
          className={`vote-particle ${color}`}
          style={{ fontSize: Math.min(0.7 + p.streak * 0.12, 1.3) + 'rem', marginBottom: 4 }}
        >
          {p.streak >= 5 ? (isLike ? '🔥' : '💥') : p.streak >= 3 ? `+${p.streak}` : '+1'}
        </span>
      ))}
      {body}
    </div>
  );
}

export function VoteBanner() {
  const { data: me } = useMe();
  const { t } = useI18n();
  const { promptSignIn } = useSignIn();
  const [dismissed, setDismissed] = useState(teaserDismissed);
  const detailMatch = useMatch('/p/:id');
  const detailProfileId = detailMatch?.params.id ?? null;

  if (!me) return null;

  const { like, dislike } = me.voteAllowance;
  const allExhausted = like.remaining === 0 && dislike.remaining === 0;
  const isAnon = me.user?.tier === 'anonymous';
  const showTeaser = isAnon && allExhausted && !dismissed;

  const dismissTeaser = () => {
    try { localStorage.setItem(TEASER_DISMISSED_KEY, '1'); } catch { /* private mode - degrade silently */ }
    setDismissed(true);
  };

  return (
    <div className="safe-bottom-bar border-t border-white/10 bg-surface/80 backdrop-blur-sm">
      {showTeaser && (
        <div className="relative flex items-center justify-center gap-1.5 px-8 pt-1.5 text-xs">
          <span className="text-white/40">{t.moreVotesAsk}</span>
          <button
            type="button"
            onClick={promptSignIn}
            className="font-medium text-accent transition-colors hover:text-accent/80"
          >
            {t.moreVotesTeaser}
          </button>
          <button
            type="button"
            onClick={dismissTeaser}
            aria-label={t.close}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/30 hover:text-white/60"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center justify-center gap-4 py-2 text-sm text-white/50">
        <span>{allExhausted ? t.nextVote : t.votesLeft}</span>
        <VoteSlot type="like" remaining={like.remaining} nextAt={like.nextAt} voteOnProfileId={detailProfileId} />
        <VoteSlot type="dislike" remaining={dislike.remaining} nextAt={dislike.nextAt} voteOnProfileId={detailProfileId} />
      </div>
    </div>
  );
}
