import type { Profile } from '../../types/profile';
import { useI18n } from '../../i18n/I18nContext';
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
  const { t } = useI18n();
  const items = interleave(profiles, recentlyAdded);
  const borderClass = accentColor === 'positive' ? 'border-r-2 border-positive' : 'border-l-2 border-negative';
  const textColor = accentColor === 'positive' ? 'text-positive' : 'text-negative';

  return (
    <div className={`flex flex-col h-full min-h-0 ${borderClass}`}>
      <div className="px-3 py-2 border-b border-border">
        <h2 className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {items.map(({ profile, isNew }) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            variant="default"
            isNew={isNew}
            reverseVotes={accentColor === 'negative'}
          />
        ))}
        {items.length === 0 && (
          <p className="text-center text-text-secondary text-sm py-8">{t.noProfiles}</p>
        )}
      </div>
    </div>
  );
}
