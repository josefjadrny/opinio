import type { Profile } from '../../types/profile';
import { useI18n } from '../../i18n/I18nContext';
import { ProfileCard } from '../profile/ProfileCard';

interface MobileFeedProps {
  positiveProfiles: Profile[];
  positiveRecent: Profile[];
  negativeProfiles: Profile[];
  negativeRecent: Profile[];
}

export function MobileFeed({
  positiveProfiles,
  positiveRecent,
  negativeProfiles,
  negativeRecent,
}: MobileFeedProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="p-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-positive mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-positive rounded-full" />
          {t.gaining}
        </h2>
        <div className="space-y-1.5">
          {[...positiveProfiles.slice(0, 10), ...positiveRecent].map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              variant="compact"
              isNew={positiveRecent.some((r) => r.id === profile.id)}
            />
          ))}
        </div>
      </section>

      <div className="border-t border-border mx-3" />

      <section className="p-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-negative mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-negative rounded-full" />
          {t.losing}
        </h2>
        <div className="space-y-1.5">
          {[...negativeProfiles.slice(0, 10), ...negativeRecent].map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              variant="compact"
              isNew={negativeRecent.some((r) => r.id === profile.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
