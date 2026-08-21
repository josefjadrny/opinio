import { Avatar } from '../profile/Avatar';
import { useI18n } from '../../i18n/I18nContext';
import type { Profile } from '../../types/profile';

// Page title for a profile route, sitting in the empty space above the map.
//
// The name is an h1 and the kicker above it an h2. DesktopProfileModal carries
// its own h1 for the same opinio, so above 1366 the route has two - deliberate,
// see the CLAUDE.md note: the map does not render below 1366, and the modal
// heading is what guarantees the route always has one. The crawler-visible
// heading on a bare /p/<id> comes from the SPA (the worker only injects <head>
// there), which is why this one is worth carrying at all.
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
// pointer-events-none: it overlays the map and must never eat a country hover.
export function MapProfileTitle({ profile, hasVotes }: { profile: Profile | null; hasVotes: boolean }) {
  const { t } = useI18n();
  return (
    <div
      className={`absolute top-4 left-0 right-0 z-10 px-4 pointer-events-none select-none transition-all duration-500 ${
        profile ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      }`}
    >
      {/* The card is a plain div holding two sibling headings, not one h1 around
          both: the kicker is an h2 and cannot legally nest inside an h1, and
          splitting them leaves the h1's text as exactly the opinio name instead
          of "what the world thinks <name>". flex-col-REVERSE is what keeps the
          source order h1-then-h2 while the kicker still renders above the name,
          so the heading outline never runs an h2 ahead of the h1. */}
      {profile && (
        <div className="flex w-full flex-col-reverse items-center gap-1.5 rounded-xl bg-surface-light/60 backdrop-blur-md ring-1 ring-white/[0.08] shadow-xl shadow-black/20 px-6 py-4">
          <h1 className="flex items-center justify-center gap-3 w-full min-w-0">
            <Avatar
              name={profile.name}
              imageUrl={profile.imageUrl}
              className="w-14 h-14 shrink-0 text-sm ring-2 ring-white/10"
            />
            <span className="truncate text-white text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              {profile.name}
            </span>
          </h1>
          {/* A brand-new opinio has no votes, so every country paints NO_DATA_FILL
              and the map is legitimately blank. Saying "what the world thinks" over
              an empty map reads as broken; naming the empty state explains it. */}
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {hasVotes ? t.mapWorldThinks : t.noVotesYet}
          </h2>
        </div>
      )}
    </div>
  );
}
