import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnchoredTip } from './AnchoredTip';

interface StatTipProps {
  /** What the trigger reads as to a screen reader - the panel is decorative. */
  label: string;
  /** The panel's contents. */
  panel: ReactNode;
  /** Fixed panel width; omit to size to the content. */
  width?: number;
  /** Padding for the panel box. */
  panelClassName?: string;
  /** Classes for the trigger button. */
  className?: string;
  children: ReactNode;
}

// A number that explains itself: hover (or tap) it and a panel spells out what
// it is made of. IconTip's sibling - same panel, different trigger contract,
// because these are readable figures rather than actions:
//
//   - Touch DOES open it. There is no action to run instead, so a tap is the
//     only way to read the explanation on a phone; IconTip's touch guard exists
//     precisely because tapping an icon button already does something.
//   - Which means it needs an outside-pointerdown close: touch has no
//     mouseleave, so a tapped-open panel would otherwise stay up for good.
//   - `cursor-help`, not a pointer - nothing navigates.
export function StatTip({ label, panel, width, panelClassName = 'px-3 py-2.5', className = '', children }: StatTipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`cursor-help rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${className}`}
      >
        {children}
      </button>
      {open && (
        <AnchoredTip anchorEl={triggerRef.current} width={width} content={label} className={panelClassName}>
          {panel}
        </AnchoredTip>
      )}
    </>
  );
}
