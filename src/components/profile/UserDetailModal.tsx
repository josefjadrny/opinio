import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useMe } from '../../hooks/useMe';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { useI18n } from '../../i18n/I18nContext';
import { Avatar } from './Avatar';
import { CountryFlag } from '../common/CountryFlag';
import { ProfileList } from './ProfileList';
import { VoteStat } from '../common/VoteStat';

interface UserDetailModalProps {
  userId: string;
}

const LOCALE_TO_BCP47: Record<string, string> = { en: 'en-US', cs: 'cs-CZ', es: 'es-ES', de: 'de-DE', fr: 'fr-FR' };

function formatJoinDate(iso: string, locale: string) {
  const tag = LOCALE_TO_BCP47[locale] ?? 'en-US';
  return new Date(iso).toLocaleDateString(tag, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ShareUserButton({ userId, displayName }: { userId: string; displayName: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const url = `${window.location.origin}/u/${userId}`;
    const title = `@${displayName} - Opinio`;
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, url }); return; } catch { return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.linkCopied, url);
    }
  }
  return (
    <button
      onClick={handleShare}
      title={copied ? t.linkCopied : t.share}
      aria-label={t.share}
      className="text-white/60 hover:text-white/90 transition-colors p-1 shrink-0"
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
  );
}

export function UserDetailModal({ userId }: UserDetailModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, locale } = useI18n();
  const { data: user, isLoading, error } = useUser(userId);
  const { data: me } = useMe();

  // Display name, photo and country are edited in Settings but rendered here,
  // so your own profile is the natural place to reach for them. Only ever
  // shown to the owner - visitors see the unchanged header.
  const isMe = !!me?.user && me.user.id === userId && me.user.tier !== 'anonymous';

  const close = () => navigate('/' + location.search);
  const { sheetRef, dragHandlers } = useSheetDrag(close);
  const openProfile = (profileId: string) => navigate('/p/' + profileId + location.search, {
    state: { fromUserId: userId, fromUserName: user?.displayName ?? null },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notFound = !!error;
  const hasAvatar = !!user?.avatarUrl;

  const fromProfileState = location.state as { fromProfileId?: string; fromProfileName?: string } | null;
  const BackToProfile = fromProfileState?.fromProfileId ? (
    <Link
      to={`/p/${fromProfileState.fromProfileId}${location.search}`}
      title={fromProfileState.fromProfileName ? `← ${fromProfileState.fromProfileName}` : 'Back'}
      aria-label={fromProfileState.fromProfileName ? `Back to ${fromProfileState.fromProfileName}` : 'Back'}
      className="text-white/60 hover:text-white/90 transition-colors p-0.5 -ml-1 shrink-0"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  ) : null;

  const SettingsButton = isMe ? (
    <button
      onClick={() => navigate('/settings' + location.search)}
      title={t.settings}
      aria-label={t.settings}
      className="text-white/60 hover:text-white/90 transition-colors p-1 shrink-0"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  ) : null;

  const StatsBlock = user && (
    <VoteStat
      likes={user.totalLikesReceived}
      dislikes={user.totalDislikesReceived}
      label={t.userVotesReceived}
      title={`${t.userLikesReceived} · ${t.userDislikesReceived}`}
      size="md"
    />
  );

  const Actions = (
    <div className="flex items-center gap-1 shrink-0">
      {SettingsButton}
      {user && <ShareUserButton userId={user.id} displayName={user.displayName} />}
      <button onClick={close} aria-label={t.close} className="text-white/60 hover:text-white/90 transition-colors p-1">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  // Speech bubble: the tail points up at the avatar so the bio reads as the
  // person saying it. Two stacked CSS triangles - the outer one is the border,
  // the inner one repeats the panel's rgba fill (not a solid colour) so it
  // blends identically over the sheet and the desktop modal, which sit on
  // different surfaces. The inner sits 1px lower to hide the panel's top
  // border where the tail meets it.
  const tailLeft = isMobile ? 15 : 21; // avatar centre minus half the tail
  const Bio = user?.bio ? (
    <div className="relative rounded-xl border border-border bg-white/[0.04] px-3.5 py-2.5">
      <span
        aria-hidden
        className="absolute w-0 h-0 border-x-[7px] border-x-transparent border-b-[7px] -top-[7px]"
        style={{ left: tailLeft, borderBottomColor: 'var(--color-border)' }}
      />
      <span
        aria-hidden
        className="absolute w-0 h-0 border-x-[7px] border-x-transparent border-b-[7px] -top-[6px]"
        style={{ left: tailLeft, borderBottomColor: 'rgba(255,255,255,0.04)' }}
      />
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line break-words">{user.bio}</p>
    </div>
  ) : null;

  // Profile card, same shape at both sizes: identity + actions on the first
  // line, bio and the vote stat sharing the second. Only the avatar changes
  // size. The stat sits directly under the action icons, and the bio starts at
  // the card's left edge rather than indenting under the handle.
  const Header = user && (
    <div className={`flex flex-col min-w-0 ${isMobile ? 'gap-2' : 'gap-2.5'}`}>
      <div className="flex items-start gap-3 min-w-0">
        {BackToProfile}
        <Avatar
          name={user.displayName}
          imageUrl={user.avatarUrl}
          className={`${isMobile ? 'w-11 h-11' : 'w-14 h-14'} shrink-0`}
          isAnonymous={!hasAvatar}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
            {/* Just the handle - this is a profile card, and the searchable
                context lives in <title> + description (the bio feeds the
                latter when the user wrote one). */}
            <h1 className="font-semibold text-white truncate min-w-0">@{user.displayName}</h1>
            {user.countryCode && <CountryFlag code={user.countryCode} />}
          </div>
          <p className="text-[11px] text-white/60 truncate">{t.userJoined.replace('{date}', formatJoinDate(user.createdAt, locale))}</p>
        </div>
        {Actions}
      </div>

      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="flex-1 min-w-0">{Bio}</div>
        {StatsBlock}
      </div>
    </div>
  );

  const ProfilesList = user && (
    <ProfileList
      profiles={user.profiles}
      label={t.userReportedProfiles}
      count={user.profiles.length}
      emptyText={t.userNoProfiles}
      onOpen={openProfile}
    />
  );

  const NotFoundView = (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Avatar name="?" imageUrl={null} className="w-12 h-12" isAnonymous />
      </div>
      <p className="text-base font-semibold text-white mb-1">{t.userNotFoundTitle}</p>
      <p className="text-sm text-white/60 mb-5 max-w-xs">{t.userNotFoundBody}</p>
      <button
        onClick={close}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
      >
        {t.userNotFoundCta}
      </button>
    </div>
  );

  const LoadingView = (
    <div className="px-6 py-10 text-center text-sm text-white/60">{t.loading}</div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={close} />
        <div ref={sheetRef} className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1 shrink-0" {...dragHandlers}>
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="px-4 py-3 border-b border-border shrink-0" {...dragHandlers}>
            {user ? Header : (
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-semibold text-white/70 min-w-0 truncate">{notFound ? t.userNotFoundLabel : ''}</span>
                {Actions}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-14 space-y-4">
            {isLoading && LoadingView}
            {notFound && NotFoundView}
            {user && ProfilesList}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="bg-surface-light border border-border rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-4 flex flex-col max-h-[calc(100dvh-10rem)] mb-16 overflow-hidden pointer-events-auto">
        <div className="px-6 py-4 border-b border-border shrink-0">
          {user ? Header : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white/70 flex-1">{notFound ? t.userNotFoundLabel : isLoading ? t.loading : ''}</span>
              {Actions}
            </div>
          )}
        </div>
        {isLoading && LoadingView}
        {notFound && NotFoundView}
        {user && (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {ProfilesList}
          </div>
        )}
      </div>
    </div>
  );
}
