// Shared tier card — displays one of Anonymous / Registered / Supporter with a
// tone, optional CTA, and a check badge when it's the user's current tier.
// Used by AboutModal (interactive) and WelcomeModal (display-only).

export type TierTone = 'muted' | 'accent' | 'positive';

const TIER_TONES: Record<TierTone, { border: string; bg: string; hoverBg: string; label: string; count: string; activeRing: string; activeBg: string; activeBadge: string; promoBg: string; promoText: string }> = {
  muted:    { border: 'border-white/10',    bg: 'bg-white/[0.03]',    hoverBg: 'hover:bg-white/[0.08]',    label: 'text-white/50',  count: 'text-white/90', activeRing: 'ring-white/40',    activeBg: 'bg-white/[0.08]',    activeBadge: 'bg-white/70 text-black',     promoBg: 'bg-white/[0.08]',    promoText: 'text-white/70' },
  accent:   { border: 'border-accent/30',   bg: 'bg-accent/[0.06]',   hoverBg: 'hover:bg-accent/[0.12]',   label: 'text-accent',    count: 'text-white',     activeRing: 'ring-accent/60',   activeBg: 'bg-accent/[0.15]',   activeBadge: 'bg-accent text-white',       promoBg: 'bg-accent/15',       promoText: 'text-accent' },
  positive: { border: 'border-positive/30', bg: 'bg-positive/[0.06]', hoverBg: 'hover:bg-positive/[0.12]', label: 'text-positive',  count: 'text-white',     activeRing: 'ring-positive/60', activeBg: 'bg-positive/[0.15]', activeBadge: 'bg-positive text-white',     promoBg: 'bg-positive/15',     promoText: 'text-positive' },
};

export function TierCard({ label, count, unit, promo, subline, trailingIcon, tone, active, onClick, disabled }: {
  label: string;
  count: number;
  unit: string;
  /** Tone-tinted pill highlighting the tier's tagline benefit (e.g. "Posting unlocked", "Extra votes"). */
  promo?: string;
  subline?: string;
  trailingIcon?: React.ReactNode;
  tone: TierTone;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const c = TIER_TONES[tone];
  const clickable = !!onClick && !active;
  // ring-inset so the active highlight lives inside the card border instead of
  // bleeding ~2px outside it, which would visually shrink the gap on whichever
  // side the active card sits.
  const baseCls = `relative rounded-lg border ${c.border} ${active ? `${c.activeBg} ring-2 ring-inset ${c.activeRing}` : c.bg} p-2.5 text-center transition-colors`;
  const body = (
    <>
      {active && (
        <span aria-label="Your current tier" className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow ${c.activeBadge}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <p className={`text-[10px] uppercase tracking-wider font-medium ${c.label} flex items-center justify-center gap-1`}>
        <span>{label}</span>
        {trailingIcon}
      </p>
      <p className={`text-2xl font-bold leading-none mt-1.5 ${c.count}`}>{count}</p>
      <p className="text-[10px] text-white/50 mt-1">{unit}</p>
      {promo && (
        <span className={`inline-block rounded-full px-2 py-0.5 mt-1.5 text-[10px] font-semibold tracking-wide ${c.promoBg} ${c.promoText}`}>
          {promo}
        </span>
      )}
      {subline && <p className="text-[10px] text-white/55 mt-1 font-medium">{subline}</p>}
    </>
  );
  if (clickable) {
    // w-full guarantees the button fills its grid cell. Without it, a default
    // <button> is display:inline-block and shrinks to its content width when
    // wrapped (e.g. AboutModal wraps the Supporter card in a relative div for
    // the price-tag overhang) — visible as a narrower card vs its neighbours.
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${baseCls} ${c.hoverBg} w-full cursor-pointer disabled:opacity-60 disabled:cursor-wait`}
      >
        {body}
      </button>
    );
  }
  return <div className={baseCls}>{body}</div>;
}
