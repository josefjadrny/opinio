import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { formatNumber } from '../../utils/formatNumber';
import { StatTip } from '../common/StatTip';
import { VoteSentimentBar } from './VoteSentimentBar';

interface VoteHeadlineProps {
  likes: number;
  dislikes: number;
  totalLikes: number;
  totalDislikes: number;
}

const PANEL_W = 236;

// One row of derived numbers over the sentiment bar. Neither figure says what
// it is made of, so each opens the same panel the vote counts do - with one
// sentence, not a table. The counts themselves are on the row right below, so a
// panel that listed them again was repeating what the reader can already see;
// what is NOT on screen is the 24h window (votes expire, so both figures are a
// live reading) and the ranking rule (net, not ratio - the product decision in
// CLAUDE.md, and the one readers assume works the other way round).
//
// Shared by the desktop modal and the mobile sheet, which rendered the same
// block twice.
export function VoteHeadline({ likes, dislikes, totalLikes, totalDislikes }: VoteHeadlineProps) {
  const { t } = useI18n();
  const total = likes + dislikes;
  const agreePct = total > 0 ? Math.round((likes / total) * 100) : 0;
  const net = likes - dislikes;
  const netTone = net > 0 ? 'text-positive bg-positive/15' : net < 0 ? 'text-accent bg-accent/15' : 'text-white/50 bg-white/10';

  // The window is a separate string rather than markup inside the sentence so
  // each language can decline it ("posledních 24 hodin", "letzten 24 Stunden")
  // and put it where its own grammar wants. The percent sign is part of the
  // emphasised token rather than a stray character after it, and it stays in
  // the sentence because the space before it is a per-language typographic rule
  // (en "79%", cs and fr "79 %").
  // The two sides are named in the sentence and carry the same green and red
  // they carry everywhere else, so "likes minus dislikes" reads as the bar and
  // the buttons below rather than as two more words.
  const TOKENS: Record<string, { text: string; tone: string }> = {
    '{window}': { text: t.voteTipWindow, tone: 'text-white' },
    '{likes}': { text: t.voteTipLikes, tone: 'text-positive' },
    '{dislikes}': { text: t.voteTipDislikes, tone: 'text-negative' },
  };
  const plain = (s: string) =>
    Object.entries(TOKENS).reduce((acc, [k, v]) => acc.replace(k, v.text), s).replace('{percent}', String(agreePct));
  const sentence = (s: string): ReactNode => (
    <p className="text-sm text-white/80 leading-snug">
      {s.split(/(\{percent\}\s?%|\{window\}|\{likes\}|\{dislikes\})/).map((part, i) => {
        const token = TOKENS[part];
        if (token) return <strong key={i} className={`font-semibold ${token.tone}`}>{token.text}</strong>;
        if (part.startsWith('{percent}')) {
          return <strong key={i} className="font-semibold text-white">{part.replace('{percent}', String(agreePct))}</strong>;
        }
        return part;
      })}
    </p>
  );

  return (
    <div className="space-y-2.5" style={{ animation: 'stat-in 0.35s ease-out' }}>
      <div className="flex items-end justify-between">
        <StatTip
          label={plain(t.voteTipAgreeHelp)}
          panel={sentence(t.voteTipAgreeHelp)}
          width={PANEL_W}
          className="flex items-baseline gap-1 px-1 -mx-1 hover:bg-positive/10"
        >
          <span className="text-positive text-xl font-bold tabular-nums leading-none">{agreePct}%</span>
          <span className="text-sm text-text-secondary">{t.liked}</span>
        </StatTip>
        <StatTip
          label={`${t.voteTipNet} ${net > 0 ? '+' : ''}${net}. ${plain(t.voteTipNetHelp)}`}
          panel={sentence(t.voteTipNetHelp)}
          width={PANEL_W}
          className={`text-lg font-bold tabular-nums px-2 py-0.5 !rounded-full ${netTone}`}
        >
          {net > 0 ? '+' : ''}{formatNumber(net)}
        </StatTip>
      </div>
      <VoteSentimentBar likes={likes} dislikes={dislikes} totalLikes={totalLikes} totalDislikes={totalDislikes} />
    </div>
  );
}
