import type { Profile } from '../../types/profile';
import { useI18n } from '../../i18n/I18nContext';
import { ProfileCard } from '../profile/ProfileCard';
import { OfflineEmptyState } from '../common/Offline';
import { useFlipReorder } from '../../hooks/useFlipReorder';

interface MobileFeedProps {
  positiveProfiles: Profile[];
  negativeProfiles: Profile[];
  /** No data and no way to fetch it - offline, or the API is unreachable. */
  unreachable?: boolean;
}

export function MobileFeed({
  positiveProfiles,
  negativeProfiles,
  unreachable,
}: MobileFeedProps) {
  const { t } = useI18n();
  const positiveFlipRef = useFlipReorder();
  const negativeFlipRef = useFlipReorder();

  // With nothing cached to show, the two empty sections read as a broken app -
  // replace the whole feed with the reason it is empty.
  if (unreachable && positiveProfiles.length === 0 && negativeProfiles.length === 0) {
    return (
      <div className="safe-feed-pad flex-1 flex flex-col min-h-0 overflow-y-auto overscroll-y-contain">
        <OfflineEmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
    <div className="safe-feed-pad flex-1 overflow-y-auto overscroll-y-contain">
      <section className="px-1.5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-positive mb-2 ml-2 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
          {t.trending}
        </h2>
        <div ref={positiveFlipRef} className="space-y-1.5">
          {positiveProfiles.map((profile) => (
            <div key={profile.id} data-flip-key={profile.id}>
              <ProfileCard
                profile={profile}
                variant="compact"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-border mx-1.5" />

      <section className="px-1.5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-negative mb-2 ml-2 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
          </svg>
          {t.falling}
        </h2>
        <div ref={negativeFlipRef} className="space-y-1.5">
          {negativeProfiles.map((profile) => (
            <div key={profile.id} data-flip-key={profile.id}>
              <ProfileCard
                profile={profile}
                variant="compact"
                reverseVotes
              />
            </div>
          ))}
        </div>
      </section>
    </div>
    </div>
  );
}
