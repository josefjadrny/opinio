import type { AnimationEvent } from 'react';
import { Avatar } from '../profile/Avatar';
import { useI18n } from '../../i18n/I18nContext';
import { useSubjectSwap } from '../../hooks/useSubjectSwap';
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
// Layout is the avatar and the text column as ONE centred group, not a text cell
// centred inside a full-width card. The distinction is the whole point: a
// full-width cell centres its text in the middle of the card and leaves the
// avatar stranded at the left edge with a gap between them, which reads as a bug
// at every width wider than the name. Here the column is sized to its content
// (no flex-1) and shrinks only once the name needs the room, so the avatar always
// sits directly beside the text.
//
// The name is NOT balanced across its two lines. `text-balance` splits them
// evenly, which on a centred block re-opens the same gap - a name a hair too long
// for one line becomes two half-width lines floating away from the avatar.
// Greedy wrapping fills the first line to the column edge, so the text starts
// beside the avatar and only the shorter last line is centred under it.
//
// The name is NOT fitted to the string. Size comes from the card's own width
// (`cqi`, hence the `@container`), so every opinio is captioned at the same size
// at the same window size - a per-string fit made one name 30px and the next 22px
// on an unchanged layout, and the caption is the same object either way. Long
// names wrap instead, and the width freed by dropping the old centred text cell
// makes that rare: a 40-char statement - the input cap - holds one line at a Full
// HD map column, and only a translation that runs well past it takes a second.
//
// pointer-events-none on the wrapper: it overlays the map and must never eat a
// country hover. The close button re-enables them for itself alone.
//
// Changing subject is animated as a crossfade in place, not a re-render: the
// outgoing row sinks out while the incoming one rises in, both at once, inside
// one grid cell. useSubjectSwap holds the two subjects; each row is keyed on its
// own, so the animations replay every time, and the global state shares the key
// space with the opinios - global -> opinio animates exactly like opinio ->
// opinio.
//
// What crossfades is the ROWS, not the card. Stacking two whole cards doubles a
// translucent background, a hairline ring and a shadow for the length of the
// swap, which reads as the caption darkening every time you open an opinio.
// The shell - background, blur, ring, padding, container query - stays put as one
// object and its contents change, which is also the truer description of what
// this thing is.
//
// The two must overlap rather than queue. Measured against a click, a
// leave-then-enter sequence settled ~450ms after the profile modal it captions
// (170ms of leave before 340ms of enter, plus the mark/name stagger) and read as
// the caption trailing the modal; overlapped, both land within ~50ms of each
// other. Same reason the leave is the shorter of the two: it is spending its
// time underneath the arriving subject, not in front of the reader.

// py-[14px] rather than the 12 a py-3 would give: the extra 2px top and bottom
// buy the row breathing room AND drop the title's first line clear of the close
// button's 34px corner, which is what the padding used to be inflated to solve.
// The shell: everything that stays put while the subject changes - the surface,
// the ring, the blur, the padding, and the container query the type is sized
// from. It holds no layout of its own beyond the stack; the row does that.
const CARD =
  '@container relative w-full rounded-xl bg-surface-light/60 backdrop-blur-md ring-1 ring-white/[0.08] shadow-xl shadow-black/20 px-5 py-[14px]';

// One subject's row inside the shell.
const ROW = 'flex w-full items-center justify-center gap-4';

// Both rows occupy the same grid cell, so the outgoing one keeps its place under
// the incoming one for the length of the crossfade instead of being laid out
// beside it. Grid rather than absolute positioning: the cell still takes part in
// sizing, so the shell keeps the row's height with no explicit height anywhere.
const STACK = '[grid-area:1/1]';

// The avatar's mirror on the far side. Without it the centred group is the avatar
// PLUS the text, so the text itself sits half an avatar right of the card's
// centre line - visible at any width, and the thing that made the caption look
// subtly off. With it the text column is centred on the card and the avatar hugs
// its left edge. It is not the old fixed 52px track, though - it is the ONLY
// shrinkable item in the row, so a name that needs the width takes all of it back
// and only then does the group go flush.
//
// "Only" is load-bearing, and it cannot be done with a shrink factor. Flex splits
// a deficit across every shrinkable item in proportion to basis x factor, so
// however large a factor this spacer carries, the text column still absorbs a
// sliver - and a sliver is all it takes to wrap a line. Measured on the live page:
// a 686px card left the spacer holding 19px while the column sat at 543 against a
// name that needed 543.x, so the last word dropped to a second line with the room
// to fit it sitting right there, unused. The column is shrink-0 and bounded by a
// max-width instead, which leaves this the only item that can yield.
const SPACER = 'w-[52px]';

// flex-col-REVERSE keeps the source order h1-then-h2 while the kicker still
// renders above the name, so the heading outline never runs an h2 ahead of the
// h1. No flex-1, so a short name leaves the group hugging its own width and
// centred.
//
// shrink-0 with a max-width rather than a shrink factor - see SPACER for why. The
// bound is the row's own arithmetic: 100% is the card's content box, less the 52px
// avatar and the two 16px gaps, which is exactly what the column can occupy once
// the spacer has collapsed. Keep it in step with the avatar size and the row gap.
const COLUMN =
  'flex min-w-0 shrink-0 max-w-[calc(100%-84px)] flex-col-reverse items-center gap-0.5 text-center';

const NAME = 'font-extrabold tracking-tight leading-[1.15]';

// Clamped so the caption never outgrows the card on an ultrawide column nor
// collapses on a narrow one; between those it tracks the column.
const NAME_SIZE = 'clamp(18px, 4.4cqi, 30px)';

// The kicker tracks the column too, and for the same reason: at a 1400px window
// the longest of them ("live world opinion on every country") wrapped its last
// word onto a second line while the card still had room around it. leading-5 is
// fixed on purpose - the row's height must not move with the font size, because
// the close button's clearance is measured from it.
const KICKER = 'font-semibold uppercase tracking-[0.16em] leading-5 text-white/50';
const KICKER_SIZE = 'clamp(11px, 2.2cqi, 13px)';

export function MapProfileTitle({
  profile,
  onDismiss,
  suppressed = false,
}: {
  profile: Profile | null;
  onDismiss: () => void;
  // HotBanner lands in this same slot on the home map. It is ~20px shorter than
  // this card, so layering it on top left a strip of caption visible underneath;
  // the caption steps aside for it instead, and slides back when it leaves.
  suppressed?: boolean;
}) {
  const { t } = useI18n();
  const { current, outgoing, endOutgoing } = useSubjectSwap(profile?.id ?? 'global', profile);
  // The outgoing row is dropped the moment its own animation reports finished.
  // caption-enter and the staggered mark/name animations bubble to this same
  // handler from the row beside it, so the name has to be checked.
  const onRowAnimationEnd = (e: AnimationEvent) => {
    if (e.animationName === 'caption-leave') endOutgoing();
  };
  return (
    <div
      className={`absolute top-4 left-0 right-0 z-10 px-4 pointer-events-none select-none transition-all duration-300 ease-out ${
        suppressed ? 'opacity-0 -translate-y-3' : 'opacity-100 translate-y-0'
      }`}
      aria-hidden={suppressed}
    >
      <div className={CARD}>
        {/* One grid cell holding both rows (see STACK), so the outgoing subject
            fades out over the incoming one instead of before it. Its height is
            the taller of the two, which for equal-height rows is simply the row
            height - the shell never jumps mid-swap. */}
        <div className="grid w-full">
          {outgoing && (
            <CaptionRow
              key={outgoing.key}
              profile={outgoing.value}
              motion="caption-leave"
              onAnimationEnd={onRowAnimationEnd}
            />
          )}
          <CaptionRow key={current.key} profile={current.value} motion="caption-enter" />
        </div>
        {/* Lives on the shell, not in a row: it belongs to whatever the caption
            is about NOW, and a copy riding the outgoing row would leave two Xs
            stacked for the length of the swap. */}
        {current.value && (
          <button
            onClick={onDismiss}
            title={t.mapShowGlobal}
            aria-label={t.mapShowGlobal}
            className="pointer-events-auto absolute top-1.5 right-1.5 text-white/40 hover:text-white/80 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// One subject's worth of caption: the mark, the name and the kicker under it.
// Rendered once per live subject - two of them during a crossfade - and given
// the animation to play by its caller.
//
// aria-hidden on a leaving row: for those ~170ms the caption has two names in
// it, and only one of them is what the map is showing.
function CaptionRow({
  profile,
  motion,
  onAnimationEnd,
}: {
  profile: Profile | null;
  motion: string;
  onAnimationEnd?: (e: AnimationEvent) => void;
}) {
  const { t } = useI18n();
  const leaving = motion === 'caption-leave';
  return (
    <div className={`${STACK} ${ROW} ${motion}`} onAnimationEnd={onAnimationEnd} aria-hidden={leaving || undefined}>
      {profile ? (
        /* Two sibling headings, not one h1 around both: the kicker is an h2 and
           cannot legally nest inside an h1, and splitting them leaves the h1's
           text as exactly the opinio name instead of "what the world thinks
           <name>". */
        <>
          <Avatar
            name={profile.name}
            imageUrl={profile.imageUrl}
            className="caption-mark w-[52px] h-[52px] shrink-0 text-sm ring-2 ring-white/10"
          />
          <div className={`${COLUMN} caption-text`}>
            <h1 style={{ fontSize: NAME_SIZE }} className={`${NAME} text-white`}>
              {profile.name}
            </h1>
            {/* One line, whatever the data says. This is a caption naming the
                caption's subject, not a status bar: a brand-new opinio paints a
                blank map because nobody has voted yet, and the sidebars and the
                modal below already report that. Swapping the kicker to an empty
                state made the caption change its job depending on the numbers. */}
            <h2 style={{ fontSize: KICKER_SIZE }} className={KICKER}>
              {t.mapWorldThinks}
            </h2>
          </div>
        </>
      ) : (
        /* Same row, same slots, same type as the profile state - logo where the
           avatar goes, wordmark where the name goes - so switching between them
           reads as one caption changing subject rather than two components. The
           wordmark is a plain span, NOT a heading: on home the h1 is FilterBar's
           wordmark and a second one here would double it. */
        <>
          {/* The mark inline, not /favicon.svg: every logo asset we ship bakes
              in an opaque #1a1a2e background circle (favicons and launcher
              icons need one), which on this lighter card reads as a dark disc
              around the logo. Same shapes, minus that circle, cropped to the
              bubble so it fills the box. */}
          <svg viewBox="4 5 24 23" aria-hidden="true" className="caption-mark w-[52px] h-[52px] shrink-0">
            <rect x="4" y="5" width="24" height="17" rx="4" fill="#0f3460" />
            <path d="M9 22 L6 28 L16 22 Z" fill="#0f3460" />
            <polygon points="16,7 11,13 21,13" fill="#22c55e" />
            <polygon points="16,20 11,14 21,14" fill="#ef4444" />
          </svg>
          <div className={`${COLUMN} caption-text`}>
            <span style={{ fontSize: NAME_SIZE }} className={`${NAME} text-accent`}>
              {t.appName}
            </span>
            <h2 style={{ fontSize: KICKER_SIZE }} className={KICKER}>
              {t.mapGlobalTitle}
            </h2>
          </div>
        </>
      )}
      <span aria-hidden="true" className={SPACER} />
    </div>
  );
}
