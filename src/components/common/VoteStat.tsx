import { formatNumber } from '../../utils/formatNumber';

interface VoteStatProps {
  likes: number;
  dislikes: number;
  // Small uppercase caption under the counts (e.g. "Votes received" / "Votes").
  label: string;
  title?: string;
  // 'md' is the profile-card treatment: the stat is one of only two things in
  // that header, so it carries more weight than in a dense list header.
  size?: 'sm' | 'md';
}

// Right-aligned stacked stat used in the user- and country-detail modal headers:
// ▲ likes  ▼ dislikes over a small uppercase caption.
export function VoteStat({ likes, dislikes, label, title, size = 'sm' }: VoteStatProps) {
  const md = size === 'md';
  return (
    <div className="shrink-0 flex flex-col items-end gap-1" title={title}>
      <div className={`flex items-center gap-2 tabular-nums leading-none ${md ? 'text-[19px]' : 'text-[15px]'}`}>
        <span className="inline-flex items-baseline gap-0.5 text-positive font-semibold">
          <span className={md ? 'text-[16px]' : 'text-[13px]'}>▲</span>
          {formatNumber(likes)}
        </span>
        <span className="inline-flex items-baseline gap-0.5 text-negative font-semibold">
          <span className={md ? 'text-[16px]' : 'text-[13px]'}>▼</span>
          {formatNumber(dislikes)}
        </span>
      </div>
      <span className={`uppercase tracking-[0.08em] font-semibold text-white/60 leading-none ${md ? 'text-[10px]' : 'text-[9px]'}`}>
        {label}
      </span>
    </div>
  );
}
