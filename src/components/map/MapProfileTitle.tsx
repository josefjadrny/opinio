import { Avatar } from '../profile/Avatar';
import { useI18n } from '../../i18n/I18nContext';
import { useFitText } from '../../hooks/useFitText';
import type { Profile } from '../../types/profile';

// The caption above the map. Two states, same slot:
//
//   default  - the Opinio mark + wordmark under a line naming what the global
//              map shows. Always there, on the home map and on a /p/:id whose
//              tint has been dismissed; no close button, nothing to return to.
//   profile  - the open opinio's avatar + name, with a close button.
//
// Closing the profile caption does NOT close the modal (WorldMap owns that
// state): the detail stays open and readable while the map and this caption
// drop back to the global default, which is the only way to look at the world
// map while a detail is open.
//
// The name is an h1 and the kicker above it an h2. DesktopProfileModal carries
// its own h1 for the same opinio, so above 1366 the route has two - deliberate,
// see the CLAUDE.md note: the map does not render below 1366, and the modal
// heading is what guarantees the route always has one. The crawler-visible
// heading on a bare /p/<id> comes from the SPA (the worker only injects <head>
// there), which is why this one is worth carrying at all.
//
// In the default state only the descriptive line is a heading (h2) and the
// wordmark is a plain span: on the home page the h1 is the wordmark in FilterBar
// and must stay that way, while the h2 gives home its first *content* heading -
// real words about what the map is, which it otherwise has none of. `uppercase`
// is text-transform, so the crawled text keeps its normal casing.
//
// That line describes the map it sits over, and the two states do NOT show the
// same thing: the global map groups by profiles.country_code (what an opinio is
// about), the profile map by voter country. Hence "how the world sees each
// country" here and "what the world thinks" there - not one shared phrase.
//
// The kicker takes NO preposition ("what the world thinks", not "...thinks about
// X"). Czech and Polish would need the name inflected after one, and names never
// inflect - the same reason the country SEO templates lead with the subject.
//
// Sits in a card matching the opinio cards in the sidebars (ProfileCard.tsx:243:
// rounded-xl, bg-surface-light, hairline white ring) so it reads as part of the
// same family - just larger. Slightly more opaque than a sidebar card plus a
// backdrop blur, because this one sits over the map rather than a flat panel.
// The card spans the full width of the map column (the sidebars are resizable, so
// "available width" is whatever the column currently is) rather than hugging the
// name - a content-width box jumped around as you moved between opinios.
//
// The name is fitted, not truncated (see useFitText). The map column is what
// the two resizable sidebars leave over, so no breakpoint can tell whether a
// given name fits it: at Full HD a translated statement - capped at 40 chars on
// input, routinely 47+ once Czech or German is done with it - ran past the card
// and lost its ending to `truncate`, which on a one-sentence opinion cuts the
// point of the sentence. It now shrinks to fit on one line, and breaks to two
// once one line would cost more type size than it is worth.
//
// Both states run the same fit so the two cards stay the same shape - the
// wordmark simply never gets near the floor. Its row is a 3-column grid, not a
// centred flex pair: the middle track is what makes the text cell's width the
// space actually available, which is what gets measured, and the mirrored side
// tracks keep the whole thing optically centred while reserving the corner the
// close button sits in.
//
// pointer-events-none on the wrapper: it overlays the map and must never eat a
// country hover. The close button re-enables them for itself alone.
// The row both states share. The middle track is the measured one, so it must be
// the only flexible one: minmax(0,1fr) (not plain 1fr) is what lets it shrink
// below its content instead of pushing the card wide. The right track mirrors the
// avatar so the text sits on the card's centre line and clears the close button.
const ROW = 'grid w-full grid-cols-[52px_minmax(0,1fr)_52px] items-center gap-3';

// display:block on the text: the fit reads scrollWidth/scrollHeight, and both are
// meaningless on an inline box. text-center because the cell is wider than the
// text whenever the name is short.
const TEXT = 'block text-center font-extrabold tracking-tight leading-tight';

export function MapProfileTitle({
  profile,
  hasVotes,
  onDismiss,
  suppressed = false,
}: {
  profile: Profile | null;
  hasVotes: boolean;
  onDismiss: () => void;
  // HotBanner lands in this same slot on the home map. It is ~20px shorter than
  // this card, so layering it on top left a strip of caption visible underneath;
  // the caption steps aside for it instead, and slides back when it leaves.
  suppressed?: boolean;
}) {
  const { t } = useI18n();
  const title = profile ? profile.name : t.appName;
  // 32 is the size the card was designed at. The floor for a single line is 16 -
  // deliberately low, and low enough that wrapping is close to unreachable at any
  // desktop width. On this card the scarce resource is height, not type size: the
  // caption sits over the map, a second row costs ~30px of it, and the viewport it
  // has to survive is a laptop with a dock eating the bottom of the screen. So a
  // smaller line wins over a taller card every time, right down to the size the
  // sidebar cards set their own names at. Below that a second row is the lesser
  // evil and 14 is the hard floor.
  const { boxRef, spanRef, fontSize } = useFitText<HTMLSpanElement, HTMLSpanElement>({
    text: title,
    max: 32,
    minOneLine: 16,
    min: 14,
  });
  return (
    <div
      className={`absolute top-4 left-0 right-0 z-10 px-4 pointer-events-none select-none transition-all duration-300 ease-out ${
        suppressed ? 'opacity-0 -translate-y-3' : 'opacity-100 translate-y-0'
      }`}
      aria-hidden={suppressed}
    >
      {profile ? (
        /* The card is a plain div holding two sibling headings, not one h1 around
           both: the kicker is an h2 and cannot legally nest inside an h1, and
           splitting them leaves the h1's text as exactly the opinio name instead
           of "what the world thinks <name>". flex-col-REVERSE is what keeps the
           source order h1-then-h2 while the kicker still renders above the name,
           so the heading outline never runs an h2 ahead of the h1. */
        <div className="relative flex w-full flex-col-reverse items-center gap-1.5 rounded-xl bg-surface-light/60 backdrop-blur-md ring-1 ring-white/[0.08] shadow-xl shadow-black/20 px-6 py-[14px]">
          <h1 className={ROW}>
            <Avatar
              name={profile.name}
              imageUrl={profile.imageUrl}
              className="w-[52px] h-[52px] shrink-0 text-sm ring-2 ring-white/10"
            />
            <span ref={boxRef} className="min-w-0">
              <span
                ref={spanRef}
                style={{ fontSize }}
                className={`${TEXT} text-white`}
              >
                {profile.name}
              </span>
            </span>
            <span aria-hidden="true" />
          </h1>
          {/* A brand-new opinio has no votes, so every country paints NO_DATA_FILL
              and the map is legitimately blank. Saying "what the world thinks" over
              an empty map reads as broken; naming the empty state explains it. */}
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {hasVotes ? t.mapWorldThinks : t.noVotesYet}
          </h2>
          <button
            onClick={onDismiss}
            title={t.mapShowGlobal}
            aria-label={t.mapShowGlobal}
            className="pointer-events-auto absolute top-2 right-2 text-white/40 hover:text-white/80 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        /* Same card, same rows, same type as the profile state - logo where the
           avatar goes, wordmark where the name goes - so switching between them
           reads as one caption changing subject rather than two components. The
           wordmark is a plain span, NOT a heading: on home the h1 is FilterBar's
           wordmark and a second one here would double it. */
        <div className="flex w-full flex-col-reverse items-center gap-1.5 rounded-xl bg-surface-light/60 backdrop-blur-md ring-1 ring-white/[0.08] shadow-xl shadow-black/20 px-6 py-[14px]">
          <span className={ROW}>
            {/* The mark inline, not /favicon.svg: every logo asset we ship bakes
                in an opaque #1a1a2e background circle (favicons and launcher
                icons need one), which on this lighter card reads as a dark disc
                around the logo. Same shapes, minus that circle, cropped to the
                bubble so it fills the box. */}
            <svg viewBox="4 5 24 23" aria-hidden="true" className="w-[52px] h-[52px] shrink-0">
              <rect x="4" y="5" width="24" height="17" rx="4" fill="#0f3460" />
              <path d="M9 22 L6 28 L16 22 Z" fill="#0f3460" />
              <polygon points="16,7 11,13 21,13" fill="#22c55e" />
              <polygon points="16,20 11,14 21,14" fill="#ef4444" />
            </svg>
            <span ref={boxRef} className="min-w-0">
              <span
                ref={spanRef}
                style={{ fontSize }}
                className={`${TEXT} text-accent`}
              >
                {t.appName}
              </span>
            </span>
            <span aria-hidden="true" />
          </span>
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {t.mapGlobalTitle}
          </h2>
        </div>
      )}
    </div>
  );
}
