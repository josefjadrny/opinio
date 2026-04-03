import type { Profile } from '../../types/profile';
import { ProfileCard } from '../profile/ProfileCard';

interface SidebarProps {
  title: string;
  profiles: Profile[];
  recentlyAdded: Profile[];
  accentColor: 'positive' | 'negative';
}

function interleave(
  ranked: Profile[],
  recent: Profile[],
): Array<{ profile: Profile; isNew: boolean }> {
  const result = ranked.map((p) => ({ profile: p, isNew: false }));
  const insertPositions = [2, 6];

  recent.forEach((profile, i) => {
    const pos = insertPositions[i];
    if (pos !== undefined && pos <= result.length) {
      result.splice(pos, 0, { profile, isNew: true });
    }
  });

  return result;
}

export function Sidebar({ title, profiles, recentlyAdded, accentColor }: SidebarProps) {
  const items = interleave(profiles, recentlyAdded);
  const borderColor = accentColor === 'positive' ? 'border-positive' : 'border-negative';
  const textColor = accentColor === 'positive' ? 'text-positive' : 'text-negative';

  return (
    <div className={`flex flex-col h-full min-h-0 border-l-2 ${borderColor}`}>
      <div className="px-3 py-2 border-b border-border">
        <h2 className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {items.map(({ profile, isNew }, i) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            variant="default"
            isNew={isNew}
            rank={isNew ? undefined : i + 1 - (items.slice(0, i).filter((x) => x.isNew).length)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-center text-text-secondary text-sm py-8">No profiles yet</p>
        )}
      </div>
    </div>
  );
}
