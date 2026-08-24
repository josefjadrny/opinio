import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Shrink-to-fit for a single piece of display text, measured rather than guessed.
//
// The map caption sits in the map column, whose width is whatever the two
// resizable sidebars leave over - so a breakpoint-picked font size cannot know
// whether a given name fits, and a name that does not fit gets silently cut by
// `truncate`. Statements are capped at 40 chars on input but translations run
// longer (a 40-char English line comes back as a 47-char Czech one), so at Full
// HD the caption regularly lost the end of the sentence.
//
// The fit runs in two stages, the way you would set the type by hand: keep one
// line while the size stays comfortable, and only then break to two lines rather
// than shrink into illegibility.
//
// Stage one is exact and costs a single measurement: with `white-space: nowrap`
// the natural width scales linearly with font-size (the tracking is in `em`, so
// it scales with it), so one read at a reference size gives px-of-width per
// px-of-font for this exact string in this exact face. Stage two cannot be
// solved that way - where the browser breaks a line depends on the words - so it
// estimates, then steps down until the rendered block really is within maxLines.
export function useFitText<B extends HTMLElement = HTMLElement, S extends HTMLElement = HTMLElement>({
  text,
  max,
  minOneLine,
  min,
  maxLines = 2,
}: {
  text: string;
  /** Ideal size, used whenever the text fits on one line at it. */
  max: number;
  /** Below this a single line is no longer worth it, and we wrap instead. */
  minOneLine: number;
  /** Hard floor. Below it the text is clamped rather than shrunk further. */
  min: number;
  maxLines?: number;
}) {
  const boxRef = useRef<B | null>(null);
  const spanRef = useRef<S | null>(null);
  const [fit, setFit] = useState<{ fontSize: number; lines: number }>({ fontSize: max, lines: 1 });

  // The observed box changes height when the fit changes it, so an unconditional
  // setState here would re-render forever. Only a *different* fit is new state.
  const commit = useCallback((fontSize: number, lines: number) => {
    setFit((prev) => (prev.fontSize === fontSize && prev.lines === lines ? prev : { fontSize, lines }));
  }, []);

  const measure = useCallback(() => {
    const box = boxRef.current;
    const span = spanRef.current;
    if (!box || !span) return;
    const avail = box.clientWidth;
    if (!avail) return;

    // px of width per 1px of font-size, for this string at this weight/tracking.
    const REF = 100;
    const prevSize = span.style.fontSize;
    const prevWrap = span.style.whiteSpace;
    span.style.fontSize = `${REF}px`;
    span.style.whiteSpace = 'nowrap';
    const perPx = span.scrollWidth / REF;
    span.style.whiteSpace = prevWrap;
    if (perPx <= 0) {
      span.style.fontSize = prevSize;
      return;
    }

    const oneLine = avail / perPx;
    if (oneLine >= minOneLine) {
      span.style.fontSize = prevSize;
      commit(Math.floor(Math.min(oneLine, max)), 1);
      return;
    }

    // Two lines hold less than twice one line: the break lands on a word
    // boundary, so the shorter line leaves a ragged end. Start under the ideal
    // and walk down until it measures right - the loop normally runs zero or one
    // time, and the cap only matters for a single unbreakable word.
    let size = Math.max(min, Math.floor(Math.min(max, (avail * maxLines * 0.9) / perPx)));
    for (let i = 0; i < 40; i++) {
      span.style.fontSize = `${size}px`;
      const lineHeight = parseFloat(getComputedStyle(span).lineHeight) || size * 1.25;
      if (span.scrollHeight <= lineHeight * maxLines + 1 || size <= min) break;
      size -= 1;
    }
    span.style.fontSize = prevSize;
    commit(size, maxLines);
  }, [commit, max, min, minOneLine, maxLines]);

  useLayoutEffect(() => {
    measure();
  }, [measure, text]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(box);
    // Metrics change under us when the webfont swaps in, and a fit measured
    // against the fallback face is wrong by whatever the two differ by.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [measure]);

  return { boxRef, spanRef, ...fit };
}
