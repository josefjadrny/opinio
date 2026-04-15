import { useEffect } from 'react';
import { Avatar } from '../profile/Avatar';
import { useMe } from '../../hooks/useMe';
import { useI18n } from '../../i18n/I18nContext';
import { LANGUAGES, type Locale } from '../../i18n/strings';
import { useIsMobile } from '../../hooks/useIsMobile';
import { getCountryFlag, getCountryName } from '../../utils/countries';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { data: me } = useMe();
  const { t, locale, setLocale } = useI18n();
  const isMobile = useIsMobile();

  const user = me?.user;
  const isAnonymous = !user || user.tier === 'anonymous';
  const displayName = isAnonymous ? t.anonymousUser : (user?.displayName ?? t.anonymousUser);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        {/* Sheet */}
        <div className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <h2 className="text-base font-semibold text-white">{t.settings}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <SettingsContent
            displayName={displayName}
            user={user}
            isAnonymous={isAnonymous}
            t={t}
            locale={locale}
            setLocale={setLocale}
          />
        </div>
      </div>
    );
  }

  // Desktop — rendered inside map's relative container, so covers only the map
  return (
    <div
      className="absolute inset-0 z-20 flex items-start justify-center pt-12 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-white">{t.settings}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SettingsContent
          displayName={displayName}
          user={user}
          isAnonymous={isAnonymous}
          t={t}
          locale={locale}
          setLocale={setLocale}
        />
      </div>
    </div>
  );
}

function SettingsContent({
  displayName,
  user,
  isAnonymous,
  t,
  locale,
  setLocale,
}: {
  displayName: string;
  user: { avatarUrl: string | null; provider: string | null; countryCode: string | null } | undefined;
  isAnonymous: boolean;
  t: ReturnType<typeof useI18n>['t'];
  locale: string;
  setLocale: (l: Locale) => void;
}) {
  return (
    <div className="px-6 py-5 space-y-5">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <Avatar name={displayName} imageUrl={user?.avatarUrl ?? null} className="w-16 h-16" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {isAnonymous ? t.notLoggedIn : (user?.provider ?? '')}
          </p>
          {isAnonymous && (
            <p className="text-xs text-accent/70 mt-1">{t.loginToUnlock}</p>
          )}
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.displayName}</label>
        <input
          type="text"
          value={displayName}
          disabled
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/40 cursor-not-allowed"
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.country}</label>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 cursor-not-allowed">
          {user?.countryCode ? (
            <>
              <span className="text-lg leading-none">{getCountryFlag(user.countryCode)}</span>
              <span className="text-sm text-white/40">{getCountryName(user.countryCode)}</span>
            </>
          ) : (
            <span className="text-sm text-white/40">—</span>
          )}
        </div>
        {isAnonymous && (
          <p className="text-xs text-white/30 mt-1">{t.detectedFromIp}</p>
        )}
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">{t.language}</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          {Object.entries(LANGUAGES).map(([key, { label }]) => (
            <option key={key} value={key} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
