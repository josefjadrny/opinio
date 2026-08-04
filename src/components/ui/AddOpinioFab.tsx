import { useRef, useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../i18n/I18nContext';

// Floating action button for creating an opinio on mobile. Replaces the header
// add button below md. Rendered as a top-level sibling (not inside the scrolling
// feed) so its backdrop-filter samples the feed behind it - see App.tsx.
//
// Draggable: press and drag to reposition anywhere on screen for the current
// session; the position is not persisted, so a refresh resets it to the default
// bottom-right spot. A tap (no drag) opens the add-opinio form. The signature
// two-tone mark (red speech bubble + green plus, same colours as the vote
// buttons) sits on a frosted-glass disc matching the vote bar.

const SIZE = 64; // w-16 / h-16
const MARGIN = 8; // keep this far from the viewport edges
const DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag

interface Pos { x: number; y: number }

interface AddOpinioFabProps {
  onClick: () => void;
  // Drives the enter/exit animation. The button stays mounted (so it can
  // animate out); when false it scales to nothing, fades, and stops taking
  // pointer/keyboard input.
  visible: boolean;
}

export function AddOpinioFab({ onClick, visible }: AddOpinioFabProps) {
  const { t } = useI18n();
  const [pos, setPos] = useState<Pos | null>(null);
  // startX/Y = pointer origin, baseX/Y = button top-left at press, moved = past threshold
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);

  // Start hidden, then flip on after the first paint so the same pop-in tween
  // plays on initial load / reload (not just on later route changes). A double
  // rAF guarantees the browser paints the scale(0) state before it transitions.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setEntered(true)); });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);
  const shown = visible && entered;

  // Once the exit tween finishes, hard-hide the button so its backdrop-filter
  // stops compositing while off-screen; restore visibility immediately when it
  // needs to animate back in. 300ms matches the exit transitionDuration below.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (shown) { setCollapsed(false); return; }
    const id = setTimeout(() => setCollapsed(true), 320);
    return () => clearTimeout(id);
  }, [shown]);

  const clamp = useCallback((x: number, y: number): Pos => ({
    x: Math.max(MARGIN, Math.min(window.innerWidth - SIZE - MARGIN, x)),
    y: Math.max(MARGIN, Math.min(window.innerHeight - SIZE - MARGIN, y)),
  }), []);

  // Keep the button on-screen across rotation / resize.
  useEffect(() => {
    if (!pos) return;
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos, clamp]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: rect.left, baseY: rect.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setPos(clamp(d.baseX + dx, d.baseY + dy));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (d.moved) {
      // Settle at the dropped position (session only, not persisted).
      const rect = e.currentTarget.getBoundingClientRect();
      setPos(clamp(rect.left, rect.top));
    } else {
      onClick(); // it was a tap, not a drag
    }
  };

  // Keyboard access (drag is pointer-only): Enter / Space open the form.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  };

  return (
    <button
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      aria-label={t.addProfileTitle}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      style={{
        ...(pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : null),
        visibility: collapsed ? 'hidden' : 'visible',
        opacity: shown ? 1 : 0,
        // Springy overshoot popping in; a quicker accelerate-away going out.
        transform: shown ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)',
        transitionTimingFunction: shown
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.4, 0, 1, 1)',
        transitionDuration: shown ? '520ms' : '300ms',
      }}
      className={`fixed ${pos ? '' : 'safe-fab right-4'} z-[70] flex items-center justify-center rounded-full w-16 h-16 bg-surface/50 backdrop-blur-md border border-white/25 shadow-lg shadow-black/50 transition-[transform,opacity,filter] active:brightness-125 focus:outline-none touch-none cursor-grab active:cursor-grabbing ${shown ? '' : 'pointer-events-none'}`}
    >
      <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
        <path
          stroke="var(--color-negative)"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
        />
        <path
          stroke="var(--color-positive)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.75}
          d="M12 9v6M9 12h6"
        />
      </svg>
    </button>
  );
}
