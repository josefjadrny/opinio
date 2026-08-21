import { Avatar } from '../profile/Avatar';
import { useI18n } from '../../i18n/I18nContext';
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
// pointer-events-none on the wrapper: it overlays the map and must never eat a
// country hover. The close button re-enables them for itself alone.
export function MapProfileTitle({
  profile,
  hasVotes,
  onDismiss,
}: {
  profile: Profile | null;
  hasVotes: boolean;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="absolute top-4 left-0 right-0 z-10 px-4 pointer-events-none select-none">
      {profile ? (
        /* The card is a plain div holding two sibling headings, not one h1 around
           both: the kicker is an h2 and cannot legally nest inside an h1, and
           splitting them leaves the h1's text as exactly the opinio name instead
           of "what the world thinks <name>". flex-col-REVERSE is what keeps the
           source order h1-then-h2 while the kicker still renders above the name,
           so the heading outline never runs an h2 ahead of the h1. */
        <div className="relative flex w-full flex-col-reverse items-center gap-1.5 rounded-xl bg-surface-light/60 backdrop-blur-md ring-1 ring-white/[0.08] shadow-xl shadow-black/20 px-6 py-[14px]">
          <h1 className="flex items-center justify-center gap-3 w-full min-w-0 pr-8">
            <Avatar
              name={profile.name}
              imageUrl={profile.imageUrl}
              className="w-[52px] h-[52px] shrink-0 text-sm ring-2 ring-white/10"
            />
            <span className="truncate text-white text-[26px] xl:text-[32px] font-extrabold tracking-tight leading-tight">
              {profile.name}
            </span>
          </h1>
          {/* A brand-new opinio has no votes, so every country paints NO_DATA_FILL
              and the map is legitimately blank. Saying "what the world thinks" over
              an empty map reads as broken; naming the empty state explains it. */}
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-white/50">
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
          <span className="flex items-center justify-center gap-3 w-full min-w-0">
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
            <span className="truncate text-accent text-[26px] xl:text-[32px] font-extrabold tracking-tight leading-tight">
              {t.appName}
            </span>
          </span>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {t.mapGlobalTitle}
          </h2>
        </div>
      )}
    </div>
  );
}
