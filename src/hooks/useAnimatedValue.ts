import { useEffect, useRef, useState } from 'react';

const POLL_MS = 10_000;
const MIN_TICK_MS = 500;  // fastest tick — 20 ticks per poll window
const MAX_TICK_MS = 2_000;

const MAX_TICKS = Math.floor(POLL_MS / MIN_TICK_MS); // 20

/**
 * Animates a numeric value toward its target, always finishing within
 * the 10s poll window regardless of gap size.
 *
 * step    = ceil(gap / 20)   — e.g. gap 5 → step 1, gap 50 → step 3, gap 200 → step 10
 * tickMs  = clamp(10000 * step / gap, 500ms, 2000ms)
 *
 * gap  5 → step 1, tick 2000ms  → done in 10s
 * gap 20 → step 1, tick  500ms  → done in 10s
 * gap 50 → step 3, tick  600ms  → done in 10s
 * gap200 → step10, tick  500ms  → done in 10s
 */
export function useAnimatedValue(target: number): number {
  const [displayed, setDisplayed] = useState(target);
  const refs = useRef({ displayed: target, target });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = (from: number, to: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const gap = Math.abs(to - from);
    if (gap === 0) return;

    const step = Math.max(1, Math.ceil(gap / MAX_TICKS));
    const tickMs = Math.min(MAX_TICK_MS, Math.max(MIN_TICK_MS, Math.round(POLL_MS * step / gap)));

    intervalRef.current = setInterval(() => {
      const { displayed, target } = refs.current;
      if (displayed === target) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        return;
      }
      const remaining = Math.abs(target - displayed);
      const actualStep = Math.min(step, remaining); // don't overshoot
      const next = displayed < target ? displayed + actualStep : displayed - actualStep;
      refs.current.displayed = next;
      setDisplayed(next);
    }, tickMs);
  };

  useEffect(() => {
    const prev = refs.current.target;
    refs.current.target = target;

    if (target !== prev) {
      startAnimation(refs.current.displayed, target);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return displayed;
}
