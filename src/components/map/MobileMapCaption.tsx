import { useI18n } from '../../i18n/I18nContext';
import { useProfile } from '../../hooks/useProfile';
import { useProfileText } from '../../hooks/useProfileText';

// One line naming what the map below is about - the mobile answer to the desktop
// MapProfileTitle, stripped to the part that says something:
//
//   no sheet - the line describing the global map.
//   sheet up - the opinio's name, which is what the tint is about.
//
// It sits at the top of the map, over the empty band above Greenland and Siberia
// that the projection leaves there. That is the only place it costs nothing: the
// panel keeps its height, the map keeps every pixel of it, and the tinted
// countries all start below the band.
//
// It names its subject, and only that. It does NOT report the state of the data:
// a fresh opinio with no votes paints an empty map and this pill still just names
// it. The desktop caption swaps in an empty-state line there; this one is a
// caption, not a status bar, and the sheet below carries the vote counts.
//
// One line, no avatar and no kicker under it - the desktop caption's three-part
// stack would cost a second row of map for what the sheet 40px below already
// shows. A pill hugging its own text, rather than a full-width card, for the same
// reason. Nothing renders until the name is there: an empty pill, or one that
// flashes the global line first, both read as a glitch.
//
// No heading, unlike the desktop caption. Mobile's h1 is FilterBar's wordmark on
// home and the sheet's own title on /p/:id, and this panel is mounted on every
// mobile route.
//
// The states do NOT share a line, and the global one is not a name: the global
// map groups opinios by profiles.country_code (what an opinio is ABOUT) and has
// no single subject to name, while the profile map groups votes by voter country
// (where the voter IS) for exactly the one opinio the pill names.
export function MobileMapCaption({ profileId }: { profileId: string | null }) {
  const { t } = useI18n();
  // Same query key the route already fetched, so this is a cache read whenever
  // the sheet that registered the opinio is the one on screen.
  const { data: profile } = useProfile(profileId);
  // Translated, matching the sheet directly below it - two copies of one name
  // cannot disagree.
  const { name } = useProfileText(profile);
  const showProfile = !!profileId && !!name;
  if (profileId && !showProfile) return null;

  return (
    <span
      className={`max-w-full truncate rounded-full bg-surface-light/75 backdrop-blur-md ring-1 ring-white/[0.08] shadow-lg shadow-black/20 px-3 py-1 leading-[14px] select-none ${
        showProfile
          ? 'text-[13px] font-bold tracking-tight text-white'
          : 'text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70'
      }`}
    >
      {showProfile ? name : t.mapGlobalTitle}
    </span>
  );
}
