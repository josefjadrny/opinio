import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const GAP = 8; // gap between the trigger and the panel
const MARGIN = 10; // viewport clamp margin

// Type for text inside a tip panel: `text-sm text-white/80`, size and shade
// both taken from the opinio detail's description - the body copy these panels
// open next to. Brighter than text-secondary (#a0a0b0), which the sidebar cards
// use and which read as dimmer than its surroundings here; short of plain
// white, which read as louder than the thing it was labelling. Shared so the
// icon labels and the vote-stat rows cannot drift apart; the numbers beside
// those rows keep their own colours and sizes.
export const TIP_TEXT_CLASS = 'text-sm text-white/80';

interface TipLayout {
  left: number;
  top: number;
  arrowLeft: number;
  below: boolean;
}

interface AnchoredTipProps {
  /** Element the panel points at. Null until the trigger has mounted. */
  anchorEl: HTMLElement | null;
  /** Fixed panel width. Omit to size the panel to its content. */
  width?: number;
  /** Re-measure when this changes - pass whatever alters the panel's size. */
  content?: unknown;
  /** Padding/typography for the panel box; the chrome is fixed. */
  className?: string;
  children: ReactNode;
}

// The floating panel behind every hover explainer: portalled to the body,
// centred on its trigger, clamped inside the viewport and flipped below when
// there is no room above, with the arrow following the trigger after a clamp.
//
// Portalled because every one of its callers lives inside a modal that scrolls
// or clips its body, which would cut an absolutely positioned panel off. That
// also puts it outside the trigger's stacking context, hence the explicit
// z-[9999] - above the mobile ladder's top rung (the lightbox at z-95).
//
// It is `pointer-events-none`: the panel can overlap its own trigger after a
// flip, and a panel that swallowed the pointer would close itself.
export function AnchoredTip({ anchorEl, width, content, className = '', children }: AnchoredTipProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<TipLayout | null>(null);

  // Two-pass: the first render parks the panel off-screen and invisible so the
  // effect can measure the real box (the width is often the content's own), then
  // positions it. `visibility` rather than a mount gate - the panel has to be in
  // the DOM to be measurable.
  useLayoutEffect(() => {
    if (!anchorEl) return;
    const compute = () => {
      const a = anchorEl.getBoundingClientRect();
      const w = width ?? panelRef.current?.offsetWidth ?? 0;
      const h = panelRef.current?.offsetHeight ?? 0;
      // Prefer above; flip below when the panel would clear the viewport top.
      const below = a.top - h - GAP < MARGIN;
      const top = below ? a.bottom + GAP : a.top - h - GAP;
      const wanted = a.left + a.width / 2 - w / 2;
      const left = Math.max(MARGIN, Math.min(wanted, window.innerWidth - w - MARGIN));
      // Arrow follows the trigger even after the panel is clamped sideways.
      const arrowLeft = Math.max(14, Math.min(a.left + a.width / 2 - left, w - 14));
      setLayout({ left, top, arrowLeft, below });
    };
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [anchorEl, width, content]);

  return createPortal(
    <div
      role="tooltip"
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: layout?.left ?? -9999,
        top: layout?.top ?? -9999,
        width,
        visibility: layout ? 'visible' : 'hidden',
      }}
    >
      <div
        ref={panelRef}
        className={`relative bg-surface-light border border-border rounded-xl shadow-2xl ${className}`}
        style={{ animation: 'stat-in .15s ease-out' }}
      >
        {children}

        {/* Arrow - a rotated square with only the two outward edges bordered */}
        <div
          className="absolute w-2.5 h-2.5 bg-surface-light border-border rotate-45"
          style={{
            left: layout?.arrowLeft ?? 0,
            marginLeft: -5,
            top: layout?.below ? -6 : undefined,
            bottom: layout?.below ? undefined : -6,
            borderWidth: layout?.below ? '1px 0 0 1px' : '0 1px 1px 0',
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
