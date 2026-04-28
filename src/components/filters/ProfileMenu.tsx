import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '../profile/Avatar';
import { useMe } from '../../hooks/useMe';
import { useI18n } from '../../i18n/I18nContext';
import { logout, loginWithGoogle } from '../../api/client';
import { getCountryFlag } from '../../utils/countries';
import { useQueryClient } from '@tanstack/react-query';
import { HeaderButton } from '../ui/HeaderButton';

interface ProfileMenuProps {
  onOpen?: () => void;
}

export function ProfileMenu({ onOpen }: ProfileMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: me, isLoading: meLoading } = useMe();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch {
      // Proceed regardless — cookie may already be gone
    }
    await queryClient.resetQueries({ queryKey: ['me'] });
  };

  const user = me?.user;
  const isAnonymous = !user || user.tier === 'anonymous';
  const displayName = isAnonymous ? t.anonymousUser : (user?.displayName ?? t.anonymousUser);
  const anonymousFlag = meLoading ? null : (user?.countryCode ? getCountryFlag(user.countryCode) : null);
  const profileButtonLabel = isAnonymous ? t.profile : `@${displayName}`;

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
      <HeaderButton
        onClick={() => { const next = !open; setOpen(next); if (next) onOpen?.(); }}
        active={open}
        className="flex items-center gap-2 px-3 py-1.5"
      >
        {isAnonymous
          ? anonymousFlag
            ? <span className="w-6 h-6 flex items-center justify-center text-base leading-none shrink-0">{anonymousFlag}</span>
            : !meLoading && (
              <span className="relative group/warn w-6 h-6 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border shadow-xl text-xs text-white/60 whitespace-nowrap opacity-0 group-hover/warn:opacity-100 transition-opacity z-50">
                  {t.noCountryWarning}
                </div>
              </span>
            )
          : <Avatar name={displayName} imageUrl={user?.avatarUrl ?? null} className="w-6 h-6" isAnonymous={isAnonymous} />
        }
        <span className="hidden sm:inline text-white text-sm font-medium max-w-28 truncate">{profileButtonLabel}</span>
        <svg className={`w-3.5 h-3.5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </HeaderButton>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 flex flex-col">
          <button
            onClick={() => { setOpen(false); navigate('/settings' + location.search); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.settings}
          </button>

          <button
            onClick={() => { setOpen(false); navigate('/stats' + location.search); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
              <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t.stats}
          </button>

          <div className="relative group">
            <button
              onClick={() => { setOpen(false); navigate('/support' + location.search); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2.5 ${isAnonymous ? 'text-white/30 cursor-default' : 'text-white/80'}`}
              disabled={isAnonymous}
            >
              {isAnonymous ? (
                <svg className="w-4 h-4 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                  <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01" />
                </svg>
              )}
              {t.support}
            </button>
            {isAnonymous && (
              <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border shadow-xl text-xs text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {t.supportSignIn}
              </div>
            )}
          </div>

          <button
            onClick={() => { setOpen(false); navigate('/about' + location.search); }}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
            </svg>
            {t.about}
          </button>

          <div className="border-t border-border my-1" />

          {isAnonymous ? (
            <button
              onClick={() => { setOpen(false); loginWithGoogle(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
            >
              <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t.login}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M13 20v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t.logout}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
