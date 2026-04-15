import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../profile/Avatar';
import { useMe } from '../../hooks/useMe';
import { useI18n } from '../../i18n/I18nContext';

interface ProfileMenuProps {
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function ProfileMenu({ onOpenSettings, onOpenAbout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: me } = useMe();
  const { t } = useI18n();

  const user = me?.user;
  const isAnonymous = !user || user.tier === 'anonymous';
  const displayName = isAnonymous ? t.anonymousUser : (user?.displayName ?? t.anonymousUser);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/30 hover:border-white/60 transition-colors"
      >
        <Avatar name={displayName} imageUrl={user?.avatarUrl ?? null} className="w-6 h-6" />
        <span className="text-white text-sm font-medium">{t.profile}</span>
        <svg className={`w-3.5 h-3.5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <button
            onClick={() => { setOpen(false); onOpenSettings(); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.settings}
          </button>

          <button
            onClick={() => { setOpen(false); onOpenAbout(); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.about}
          </button>

          <div className="border-t border-border my-1" />

          {isAnonymous ? (
            <button
              disabled
              title={t.loginTooltip}
              className="w-full text-left px-4 py-2.5 text-sm text-white/30 cursor-not-allowed flex items-center gap-2.5"
            >
              <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {t.login}
            </button>
          ) : (
            <button
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-negative hover:bg-white/5 transition-colors flex items-center gap-2.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t.logout}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
