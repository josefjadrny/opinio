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
    <div className="flex-1 flex flex-col min-h-0">
    <div className="flex-1 overflow-y-auto">
      <section className="p-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-positive mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
          {t.trending}
        </h2>
        <div className="space-y-1.5">
          {[...positiveProfiles.slice(0, 10), ...positiveRecent].map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              variant="compact"
            />
          ))}
        </div>
      </section>

      <div className="border-t border-border mx-3" />

      <section className="p-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-negative mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
          </svg>
          {t.falling}
        </h2>
        <div className="space-y-1.5">
          {[...negativeProfiles.slice(0, 10), ...negativeRecent].map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              variant="compact"
            />
          ))}
        </div>
      </section>
    </div>
    </div>
  );
}
