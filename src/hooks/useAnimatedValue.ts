import { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 10_000;
const MIN_TICK_MS = 500;   // never faster than one tick per 500ms (looks natural)
const MAX_TICK_MS = 2_000; // never slower than one tick per 2s (feels alive)

/**
 * Animates a numeric value toward its target, always finishing within the
 * poll window (10s) so the display catches up before the next update arrives.
 *
 * Tick interval = clamp(pollWindow / |gap|, 500ms, 2000ms)
 *
 * e.g. gap of 5  → tick every 2000ms (slow, looks natural)
 *      gap of 15 → tick every  666ms
 *      gap of 50 → tick every  200ms → clamped to 500ms (5 ticks/s max)
 */
export function useAnimatedValue(target: number): number {
  const [displayed, setDisplayed] = useState(target);
  const refs = useRef({ displayed: target, target });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = (from: number, to: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const gap = Math.abs(to - from);
    if (gap === 0) return;

    const tickMs = Math.min(MAX_TICK_MS, Math.max(MIN_TICK_MS, Math.floor(POLL_INTERVAL_MS / gap)));

    intervalRef.current = setInterval(() => {
      const { displayed, target } = refs.current;
      if (displayed === target) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        return;
      }
      const next = displayed < target ? displayed + 1 : displayed - 1;
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
