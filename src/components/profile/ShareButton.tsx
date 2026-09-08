import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { IconTip } from '../common/IconTip';

interface ShareButtonProps {
  profileId: string;
  profileName: string;
}

export function ShareButton({ profileId, profileName }: ShareButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/p/${profileId}`;
    const title = `${profileName} - Opinio`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.linkCopied, url);
    }
  }

  // The label follows the button's state: for the two seconds the icon is a
  // check, hovering it reads "link copied" instead of "share".
  return (
    <IconTip label={copied ? t.linkCopied : t.share}>
      <button
        onClick={handleShare}
        aria-label={t.share}
        className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0 relative"
      >
        {copied ? (
          <svg className="w-5 h-5 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
    </IconTip>
  );
}
