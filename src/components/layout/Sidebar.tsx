import { useCallback, useRef } from 'react';
import type { Profile } from '../../types/profile';
import { useI18n } from '../../i18n/I18nContext';
import { ProfileCard } from '../profile/ProfileCard';
import { OfflineEmptyState } from '../common/Offline';
import { useFlipReorder } from '../../hooks/useFlipReorder';

interface SidebarProps {
  title: string;
  profiles: Profile[];
  accentColor: 'positive' | 'negative';
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  /** No data and no way to fetch it - offline, or the API is unreachable. */
  unreachable?: boolean;
}

export function Sidebar({ title, profiles, accentColor, onLoadMore, isLoadingMore, unreachable }: SidebarProps) {
  const { t } = useI18n();
  const borderClass = accentColor === 'positive' ? 'border-l-2 border-positive' : 'border-r-2 border-negative';
  const textColor = accentColor === 'positive' ? 'text-positive' : 'text-negative';

  // Browsers restore scroll position on F5, which fires onScroll right after
  // the list mounts and would otherwise immediately trip load-more. Only honor
  // scroll once the user has actually interacted with the pane.
  const userScrolledRef = useRef(false);
  const markUserScrolled = useCallback(() => { userScrolledRef.current = true; }, []);
  const flipRef = useFlipReorder();

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !userScrolledRef.current) return;
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
      onLoadMore();
    }
  }, [onLoadMore]);

  return (
    <div className={`flex flex-col h-full min-h-0 ${borderClass}`}>
      <div className="px-3 py-2 border-b border-border">
        <h2 className={`flex items-center justify-center gap-1.5 text-sm font-bold uppercase tracking-wider ${textColor}`}>
          {accentColor === 'positive' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
            </svg>
          )}
          {title}
        </h2>
      </div>
      <div
        onScroll={handleScroll}
        onWheel={markUserScrolled}
        onTouchStart={markUserScrolled}
        onKeyDown={markUserScrolled}
        className="flex-1 overflow-y-auto no-scrollbar px-1 py-1.5"
      >
        <div ref={flipRef} className="space-y-1">
          {profiles.map((profile) => (
            <div key={profile.id} data-flip-key={profile.id}>
              <ProfileCard
                profile={profile}
                variant="default"
                reverseVotes={accentColor === 'negative'}
              />
            </div>
          ))}
        </div>
        {profiles.length === 0 && !isLoadingMore && (
          unreachable
            ? <OfflineEmptyState />
            : <p className="text-center text-text-secondary text-sm py-8">{t.noProfiles}</p>
        )}
        {isLoadingMore && (
          <div className="flex justify-center py-3">
            <span className="block w-5 h-5 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
