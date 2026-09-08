import { useRef, useState, type ReactNode } from 'react';
import { AnchoredTip, TIP_TEXT_CLASS } from './AnchoredTip';

interface IconTipProps {
  /** What the icon does - the same string the button carries as aria-label. */
  label: string;
  /** The icon button itself. */
  children: ReactNode;
}

// Names an icon-only button on hover, in the same panel the vote counts use
// (AnchoredTip). It replaces `title=` on those buttons rather than joining it:
// the native tooltip takes about a second to appear, renders in the OS's own
// light chrome on a dark card, and can't be styled - two tooltips on one button
// would also stack.
//
// Mouse and keyboard only, deliberately:
//
//   - `pointerenter` fires with pointerType 'touch' on a tap in Chrome, so
//     without the guard a tap would leave the panel up until the next tap
//     elsewhere - and on a touch device the label is redundant anyway, since
//     the tap has already run the action.
//   - Focus opens it only when the focus is `:focus-visible`, i.e. keyboard.
//     A plain click focuses the button too, and without that check clicking
//     share would pop the label open and leave it there.
//   - `pointerdown` closes: once the action has run (a dialog opening, the
//     modal closing) the label is describing something that already happened.
//
// The wrapper is what's measured, not the button, so the panel stays centred on
// the icon; `contents` would remove the box the tooltip points at.
export function IconTip({ label, children }: IconTipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={wrapRef}
      className="inline-flex shrink-0"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true); }}
      onPointerLeave={() => setOpen(false)}
      onPointerDown={() => setOpen(false)}
      onFocus={(e) => { if ((e.target as HTMLElement).matches?.(':focus-visible')) setOpen(true); }}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <AnchoredTip anchorEl={wrapRef.current} content={label} className="px-2.5 py-1.5">
          <span className={`block whitespace-nowrap ${TIP_TEXT_CLASS}`}>{label}</span>
        </AnchoredTip>
      )}
    </span>
  );
}
