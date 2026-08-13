import { useEffect, useState } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { Link, useLocation } from 'react-router-dom';
import type { Profile } from '../../types/profile';
import type { PersonBreakdownResponse } from '../../types/api';
import { Avatar } from './Avatar';
import { ShareButton } from './ShareButton';
import { ReportProfileButton } from './ReportProfileButton';
import { DeleteProfileButton } from './DeleteProfileButton';
import { VoteSentimentBar } from './VoteSentimentBar';
import { ContentImageLightbox } from './ContentImageLightbox';
import { useMe } from '../../hooks/useMe';
import { RoleBadge } from '../common/RoleBadge';
import { SourceLink } from './SourceLink';
import { CountryFlag } from '../common/CountryFlag';
import { BreakdownRow } from './BreakdownRow';
import { formatNumber } from '../../utils/formatNumber';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { useI18n } from '../../i18n/I18nContext';
import { useProfileText } from '../../hooks/useProfileText';
import { useSheetDrag } from '../../hooks/useSheetDrag';

interface ProfileDetailModalProps {
  profile: Profile;
  breakdown: PersonBreakdownResponse | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function ProfileDetailModal({ profile, breakdown, isLoading, onClose }: ProfileDetailModalProps) {
  const location = useLocation();
  const { t, locale } = useI18n();
  const { data: me } = useMe();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { name, description, hasTranslation, showingOriginal, toggle } = useProfileText(profile);
  const { sheetRef, dragHandlers } = useSheetDrag(onClose);
  const animatedLikes = useAnimatedValue(profile.likes);
  const animatedDislikes = useAnimatedValue(profile.dislikes);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Lightbox handles its own ESC (and stops propagation); only close the
      // sheet when the lightbox isn't covering it.
      if (e.key === 'Escape' && !lightboxOpen) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, lightboxOpen]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={sheetRef} className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto pb-11" style={{ animation: 'modal-enter 0.28s ease-out' }}>
        <div className="flex justify-center pt-3 pb-1" {...dragHandlers}>
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        <div className="px-4 pt-2.5 pb-2 border-b border-border" {...dragHandlers}>
          <div className="flex items-start gap-2.5 min-w-0">
            {(() => {
              const state = location.state as { fromUserId?: string; fromUserName?: string } | null;
              if (!state?.fromUserId) return null;
              return (
                <Link
                  to={`/u/${state.fromUserId}${location.search}`}
                  title={state.fromUserName ? `← @${state.fromUserName}` : 'Back'}
                  aria-label={state.fromUserName ? `Back to @${state.fromUserName}` : 'Back'}
                  className="text-white/40 hover:text-white/80 transition-colors p-1 -ml-1 shrink-0 self-center"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              );
            })()}
            <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-10 h-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="block font-semibold text-white truncate mb-1">{name}</h1>
              <div className="flex items-center gap-1.5">
                <CountryFlag code={profile.countryCode} />
                <RoleBadge role={profile.role} />
                <div className="flex items-center gap-0.5 shrink-0 ml-auto -mr-1">
                  {me?.user.id && profile.addedById === me.user.id && (
                    <DeleteProfileButton
                      profileId={profile.id}
                      voteCount={profile.likes + profile.dislikes}
                      onDeleted={onClose}
                    />
                  )}
                  <ShareButton profileId={profile.id} profileName={profile.name} />
                  <ReportProfileButton profileId={profile.id} />
                  <button
                    onClick={onClose}
                    title={t.close}
                    aria-label={t.close}
                    className="text-white/40 hover:text-white/80 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-2 pb-5 space-y-4">
          {/* Live votes as a sentiment bar: green = likes' share of the active
              (24h) votes, red = dislikes'. Replaces the old ▲/▼ counts. */}
          {(() => {
            const total = animatedLikes + animatedDislikes;
            const agreePct = total > 0 ? Math.round((animatedLikes / total) * 100) : 0;
            const net = animatedLikes - animatedDislikes;
            const netTone = net > 0 ? 'text-positive bg-positive/15' : net < 0 ? 'text-accent bg-accent/15' : 'text-white/50 bg-white/10';
            return (
              <div className="space-y-2.5" style={{ animation: 'stat-in 0.35s ease-out' }}>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-positive text-xl font-bold tabular-nums leading-none">{agreePct}%</span>
                    <span className="text-sm text-text-secondary">{t.liked}</span>
                  </div>
                  <span className={`text-lg font-bold tabular-nums px-2 py-0.5 rounded-full transition-colors ${netTone}`}>
                    {net > 0 ? '+' : ''}{formatNumber(net)}
                  </span>
                </div>
                <VoteSentimentBar likes={animatedLikes} dislikes={animatedDislikes} totalLikes={profile.totalLikes ?? 0} totalDislikes={profile.totalDislikes ?? 0} />
              </div>
            );
          })()}
          <p className="text-sm text-white/80 leading-relaxed">{description}</p>
          {hasTranslation && (
            <button
              type="button"
              onClick={toggle}
              className="text-xs text-text-secondary/70 hover:text-accent transition-colors"
            >
              {showingOriginal ? t.seeTranslation : t.seeOriginal}
            </button>
          )}
          {profile.contentImageUrl && (
            // Text first, image second — the opinion is the primary content.
            // 220 px cap keeps the image as supporting context, not the focus;
            // full size is one tap away via the lightbox.
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full rounded-lg overflow-hidden bg-black/30 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60"
            >
              <img
                src={profile.contentImageUrl}
                alt={profile.name}
                loading="lazy"
                decoding="async"
                className="w-full h-auto max-h-[220px] object-contain"
              />
            </button>
          )}
          {profile.hasLink && (
            <div>
              <SourceLink profileId={profile.id} host={profile.linkHost} />
            </div>
          )}
          {profile.addedBy && (
            <p className="text-xs text-white/50">
              {t.reportedBy}{' '}
              {profile.addedById ? (
                <Link
                  to={`/u/${profile.addedById}${location.search}`}
                  state={{ fromProfileId: profile.id, fromProfileName: profile.name }}
                  className="text-white/55 hover:text-white/85 hover:underline underline-offset-2 decoration-white/30 transition-colors"
                >
                  @{profile.addedBy}
                </Link>
              ) : (
                <span>@{profile.addedBy}</span>
              )}
              {' · '}{formatRelativeTime(profile.createdAt, locale, t.justNow)}
            </p>
          )}

          {isLoading && (
            <p className="text-xs text-white/50 pt-1">Loading...</p>
          )}
          {breakdown && (breakdown.topLiking.length > 0 || breakdown.topDisliking.length > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border">
              <div className="pt-3 flex flex-col">
                <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-2 shrink-0">▲ {t.breakdownLiking}</p>
                <div className="overflow-y-auto max-h-[180px] pr-1 subtle-scrollbar">
                  {(() => {
                    const max = Math.max(1, ...breakdown.topLiking.map(r => r.count));
                    return breakdown.topLiking.map(({ countryCode, count }, i) => (
                      <BreakdownRow key={countryCode} countryCode={countryCode} count={count} max={max} index={i} side="like" />
                    ));
                  })()}
                </div>
              </div>
              <div className="pt-3 flex flex-col">
                <p className="text-[10px] font-bold text-negative uppercase tracking-wider mb-2 shrink-0">▼ {t.breakdownDisliking}</p>
                <div className="overflow-y-auto max-h-[180px] pr-1 subtle-scrollbar">
                  {(() => {
                    const max = Math.max(1, ...breakdown.topDisliking.map(r => r.count));
                    return breakdown.topDisliking.map(({ countryCode, count }, i) => (
                      <BreakdownRow key={countryCode} countryCode={countryCode} count={count} max={max} index={i} side="dislike" />
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {lightboxOpen && profile.contentImageUrl && (
        <ContentImageLightbox
          imageUrl={profile.contentImageUrl}
          alt={profile.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
