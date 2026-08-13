import { profileLinkUrl } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';

// Source-link chip shown in the detail modals when an opinio carries a link.
// Navigates to the API redirect endpoint (which counts the click and forwards
// to the real URL) rather than the raw link, which the client never receives.
// nofollow + noopener/noreferrer since the destination is arbitrary user input.
export function SourceLink({ profileId, host }: { profileId: string; host?: string | null }) {
  const { t } = useI18n();
  return (
    <a
      href={profileLinkUrl(profileId)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      // Showing the destination host (not just "Source") is the anti-phishing
      // transparency signal — users see where the link goes before clicking,
      // even though the full URL stays behind the /l/:id redirect.
      title={host ? `${t.sourceLink}: ${host}` : t.sourceLink}
      className="inline-flex items-center gap-1.5 max-w-full text-xs font-medium text-accent/90 hover:text-accent bg-accent/10 hover:bg-accent/15 rounded-full px-3 py-1.5 transition-colors"
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
      <span className="text-white/50">{t.sourceLink}</span>
      {host && <span className="truncate">{host}</span>}
      <svg className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  );
}
