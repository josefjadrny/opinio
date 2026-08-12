import { Avatar } from './Avatar';
import { CountryFlag } from '../common/CountryFlag';
import { RoleBadge } from '../common/RoleBadge';
import { VoteButtons } from '../voting/VoteButtons';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Role } from '../../types/profile';

// Minimal structural shape shared by Profile and UserProfileSummary - enough to
// render a list row. Both the country-detail and user-detail modals feed their
// rows through here so the two lists stay visually identical.
export interface ProfileListEntry {
  id: string;
  name: string;
  role: Role;
  imageUrl: string | null;
  countryCode: string;
  description: string;
  likes: number;
  dislikes: number;
}

export function ProfileListRow({ profile, onOpen, compact }: { profile: ProfileListEntry; onOpen: () => void; compact?: boolean }) {
  // Match the landing-page ProfileCard visual: flat surface, soft side-coloured
  // glow on hover (green rising / red falling), ringed avatar. On mobile we mirror
  // the compact feed card (smaller avatar/name/votes) so names don't crop.
  const reverseVotes = profile.dislikes > profile.likes;
  const glow = reverseVotes ? 'rgba(239,68,68,0.16)' : 'rgba(34,197,94,0.16)';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      className="group relative flex items-center gap-2.5 md:gap-3 px-2 md:px-2.5 py-2 md:py-2.5 rounded-xl bg-surface-light/40 ring-1 ring-white/[0.06] hover:ring-white/15 transition-all duration-200 overflow-hidden cursor-pointer select-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(120% 80% at 0% 0%, ${glow}, transparent 60%)` }}
      />
      <Avatar name={profile.name} imageUrl={profile.imageUrl} className="relative z-10 shrink-0 w-8 h-8 md:w-10 md:h-10 ring-2 ring-white/5" />
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-x-1.5 gap-y-0.5 flex-wrap">
          <span className="text-sm font-medium md:text-base md:font-semibold text-white truncate min-w-0 flex-shrink">{profile.name}</span>
          <CountryFlag code={profile.countryCode} />
          <RoleBadge role={profile.role} />
        </div>
        {/* Description hidden on mobile (title only), one line on desktop (>= md). */}
        <p className="hidden md:block text-[13px] text-text-secondary truncate mt-0.5">{profile.description}</p>
      </div>
      {/* Votes on the right on both breakpoints (matches the landing card). */}
      <div className="relative z-10 shrink-0" onClick={(e) => e.stopPropagation()}>
        <VoteButtons
          profileId={profile.id}
          likes={profile.likes}
          dislikes={profile.dislikes}
          compact={compact}
          reverseVotes={reverseVotes}
        />
      </div>
    </div>
  );
}

interface ProfileListProps {
  profiles: ProfileListEntry[];
  label: string;
  emptyText: string;
  onOpen: (id: string) => void;
  // Appended to the header as " (n)" when > 0 (user detail shows a count).
  count?: number;
  // While loading with no rows yet, show loadingText instead of emptyText.
  loading?: boolean;
  loadingText?: string;
}

export function ProfileList({ profiles, label, emptyText, onOpen, count, loading, loadingText }: ProfileListProps) {
  const isMobile = useIsMobile();
  // Wrapped in a single element (not a fragment) so a parent's space-y can't
  // open a gap between the header and the list - the header's own pb controls it.
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60 px-3 pb-2">
        {label}{typeof count === 'number' && count > 0 ? ` (${count})` : ''}
      </p>
      {loading && profiles.length === 0 ? (
        <p className="text-sm text-white/50 py-4 text-center">{loadingText ?? emptyText}</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-white/50 py-4 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-1">
          {profiles.map((p) => (
            <ProfileListRow key={p.id} profile={p} onOpen={() => onOpen(p.id)} compact={isMobile} />
          ))}
        </div>
      )}
    </div>
  );
}
