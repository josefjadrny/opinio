import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface Subject<T> {
  key: string;
  value: T;
}

// Keeps the subject a crossfading caption is leaving behind alive alongside the
// one arriving, so the two can animate at the SAME time.
//
// The map caption is a single card that changes what it is about (the global map
// <-> one opinio). The obvious shape - hold the old subject, fade it out, then
// bring the new one in - puts the two halves end to end, and that is exactly
// what read as lag: measured against a click, the caption settled ~450ms after
// the profile modal it was captioning, because 170ms of leave ran before 340ms
// of enter had even started. Both subjects live here at once instead, the
// caller stacks them in one slot, and the whole swap costs one animation.
//
// `outgoing` is dropped when the caller reports its leave animation finished
// (`endOutgoing`), not on a timer matching the animation's length: the route
// change that starts a swap also re-renders the map, and under that load the
// animation's first frame lands up to ~80ms late, so a timer cut it short. The
// `maxOutMs` failsafe is only for the case where the animation never runs at
// all - a caller that forgets to wire `endOutgoing` up, a background tab.
//
// Reduced motion never produces an `outgoing` at all: the swap is instant
// rather than fast, since a fast crossfade is still a crossfade.
export function useSubjectSwap<T>(
  key: string,
  value: T,
  maxOutMs = 600,
): { current: Subject<T>; outgoing: Subject<T> | null; endOutgoing: () => void } {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState<Subject<T>>({ key, value });
  const [outgoing, setOutgoing] = useState<Subject<T> | null>(null);

  useEffect(() => {
    if (current.key === key) {
      // Same subject, fresher data (a refetch, an arriving translation): take it
      // without animating - the caption's subject has not changed.
      if (!Object.is(current.value, value)) setCurrent({ key, value });
      return;
    }
    // Bouncing back to the subject already on its way out (A -> B -> A inside
    // one crossfade) needs no special case: A simply becomes current again and
    // B takes over the outgoing slot.
    setOutgoing(reducedMotion ? null : current);
    setCurrent({ key, value });
  }, [key, value, current, reducedMotion]);

  useEffect(() => {
    if (!outgoing) return;
    const failsafe = setTimeout(() => setOutgoing(null), maxOutMs);
    return () => clearTimeout(failsafe);
  }, [outgoing, maxOutMs]);

  const endOutgoing = useCallback(() => setOutgoing(null), []);

  return { current, outgoing, endOutgoing };
}
