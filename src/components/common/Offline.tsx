import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../i18n/I18nContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

function CloudOffIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M18.4 15.6A4 4 0 0016.5 8h-1.3a6 6 0 00-8.1-3.6M4.6 8.9A4 4 0 006 16.5h9" />
    </svg>
  );
}

// Slim status strip under the header. Renders nothing while online, so it costs
// an online user no vertical space.
export function OfflineBanner() {
  const { t } = useI18n();
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-200/90 text-xs font-medium"
    >
      <CloudOffIcon className="w-4 h-4 shrink-0" />
      <span className="truncate">{t.offlineBanner}</span>
    </div>
  );
}

// Shown in place of an empty feed when there is nothing cached to fall back on -
// the difference between "nobody has posted" and "we cannot reach the server"
// matters, especially in the installed app where there is no browser UI to
// explain it.
export function OfflineEmptyState() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
      <CloudOffIcon className="w-8 h-8 text-white/25" />
      <p className="text-sm font-semibold text-white/70">{t.offlineTitle}</p>
      <p className="text-xs text-text-secondary max-w-[38ch] leading-relaxed">{t.offlineBody}</p>
      <button
        type="button"
        onClick={() => queryClient.refetchQueries({ type: 'active' })}
        className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white/80 cursor-pointer transition-colors"
      >
        {t.offlineRetry}
      </button>
    </div>
  );
}
