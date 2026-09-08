import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/formatNumber';
import { useI18n } from '../../i18n/I18nContext';
import { AnchoredTip, TIP_TEXT_CLASS } from '../common/AnchoredTip';

interface VoteSentimentBarProps {
  likes: number;
  dislikes: number;
  /** All-time totals — shown in muted brackets next to the live counts. */
  totalLikes?: number;
  totalDislikes?: number;
}

const PANEL_W = 216;

// Explains one side's numbers: the live (24h) count that actually drives the
// ranking, and the lifetime total. The panel's chrome, placement and arrow are
// AnchoredTip's - shared with the icon-button labels (IconTip).
function VoteStatTooltip({
  tone,
  live,
  total,
  anchorEl,
}: {
  tone: 'positive' | 'negative';
  live: number;
  total: number;
  anchorEl: HTMLElement | null;
}) {
  const { t } = useI18n();

  const accent = tone === 'positive' ? 'text-positive' : 'text-negative';
  const barTone = tone === 'positive' ? 'bg-positive' : 'bg-negative';
  const arrowChar = tone === 'positive' ? '▲' : '▼';
  const title = tone === 'positive' ? t.voteTipLikes : t.voteTipDislikes;
  // Share of the lifetime votes still inside the 24h window — a compact hint at
  // how hot this side is right now.
  const livePct = total > 0 ? Math.min(100, (live / total) * 100) : live > 0 ? 100 : 0;

  return (
    <AnchoredTip anchorEl={anchorEl} width={PANEL_W} content={live + ':' + total} className="px-3 py-2.5">
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${accent}`}>
        <span>{arrowChar}</span>
        <span>{title}</span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className={TIP_TEXT_CLASS}>{t.voteTipLive}</span>
        <span className={`text-base font-bold tabular-nums leading-none ${accent}`}>{formatNumber(live)}</span>
      </div>
      {/* How much of the lifetime total is still live */}
      <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${livePct}%` }} />
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-1.5">
        <span className={TIP_TEXT_CLASS}>{t.voteTipAllTime}</span>
        <span className="text-sm font-semibold tabular-nums leading-none text-white">{formatNumber(total)}</span>
      </div>
    </AnchoredTip>
  );
}

// Horizontal likes-vs-dislikes proportion bar. The green segment's width is
// likes' share of the total; red fills the remainder, so the split point reads
// as the sentiment at a glance. Live counts sit at each end, with the all-time
// totals (when given) alongside in muted brackets. With no votes the track is a
// neutral grey with no fill. Each side's counts are a hover/tap target that
// opens a panel spelling out live-vs-lifetime.
export function VoteSentimentBar({ likes, dislikes, totalLikes, totalDislikes }: VoteSentimentBarProps) {
  const { t } = useI18n();
  const total = likes + dislikes;
  const likePct = total > 0 ? (likes / total) * 100 : 0;
  const hasVotes = total > 0;

  // One open side at a time; the anchor doubles as the "which side" flag.
  const [openSide, setOpenSide] = useState<'like' | 'dislike' | null>(null);
  const likeRef = useRef<HTMLButtonElement>(null);
  const dislikeRef = useRef<HTMLButtonElement>(null);

  // Touch has no mouseleave, so a tap-opened panel would stay up forever.
  // Close it on the next pointer down anywhere outside the two triggers.
  useEffect(() => {
    if (!openSide) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (likeRef.current?.contains(target) || dislikeRef.current?.contains(target)) return;
      setOpenSide(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [openSide]);

  const triggerBase =
    'inline-flex items-baseline gap-1.5 shrink-0 font-semibold text-base rounded-md px-1 -mx-1 cursor-help ' +
    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';

  return (
    <div className="flex items-center gap-2 tabular-nums leading-none">
      <button
        type="button"
        ref={likeRef}
        aria-label={`${t.voteTipLikes}: ${t.voteTipLive} ${likes}, ${t.voteTipAllTime} ${totalLikes ?? likes}`}
        onMouseEnter={() => setOpenSide('like')}
        onMouseLeave={() => setOpenSide(null)}
        onFocus={() => setOpenSide('like')}
        onBlur={() => setOpenSide(null)}
        onClick={(e) => { e.stopPropagation(); setOpenSide('like'); }}
        className={`${triggerBase} text-positive hover:bg-positive/10`}
      >
        <span className="text-base">▲</span>{formatNumber(likes)}
        {totalLikes != null && totalLikes > likes && <span className="text-xs font-normal text-positive/40">({formatNumber(totalLikes)})</span>}
      </button>
      <div className={`flex-1 h-2.5 rounded-full overflow-hidden flex ${hasVotes ? 'bg-negative/45' : 'bg-white/10'}`}>
        {hasVotes && likePct > 0 && <div className="h-full bg-positive" style={{ width: `${likePct}%`, animation: 'bar-fill 0.6s ease-out both', transformOrigin: 'left' }} />}
      </div>
      <button
        type="button"
        ref={dislikeRef}
        aria-label={`${t.voteTipDislikes}: ${t.voteTipLive} ${dislikes}, ${t.voteTipAllTime} ${totalDislikes ?? dislikes}`}
        onMouseEnter={() => setOpenSide('dislike')}
        onMouseLeave={() => setOpenSide(null)}
        onFocus={() => setOpenSide('dislike')}
        onBlur={() => setOpenSide(null)}
        onClick={(e) => { e.stopPropagation(); setOpenSide('dislike'); }}
        className={`${triggerBase} text-negative hover:bg-negative/10`}
      >
        {totalDislikes != null && totalDislikes > dislikes && <span className="text-xs font-normal text-negative/40">({formatNumber(totalDislikes)})</span>}
        {formatNumber(dislikes)}<span className="text-base">▼</span>
      </button>

      {openSide === 'like' && (
        <VoteStatTooltip tone="positive" live={likes} total={Math.max(totalLikes ?? 0, likes)} anchorEl={likeRef.current} />
      )}
      {openSide === 'dislike' && (
        <VoteStatTooltip tone="negative" live={dislikes} total={Math.max(totalDislikes ?? 0, dislikes)} anchorEl={dislikeRef.current} />
      )}
    </div>
  );
}
