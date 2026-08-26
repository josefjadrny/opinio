import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { ContentImageLightbox } from './ContentImageLightbox';
import { usePersonBreakdown } from '../../hooks/usePersonBreakdown';
import { useVote } from '../../hooks/useVote';
import { useMe } from '../../hooks/useMe';
import { useCountdown } from '../../hooks/useCountdown';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { useVoteAnimation } from '../../hooks/useVoteAnimation';
import { useI18n } from '../../i18n/I18nContext';
import { useProfileText } from '../../hooks/useProfileText';
import { Avatar } from './Avatar';
import { ShareButton } from './ShareButton';
import { ReportProfileButton } from './ReportProfileButton';
import { DeleteProfileButton } from './DeleteProfileButton';
import { VoteSentimentBar } from './VoteSentimentBar';
import { RoleBadge } from '../common/RoleBadge';
import { SourceLink } from './SourceLink';
import { CountryFlag } from '../common/CountryFlag';
import { BreakdownRow } from './BreakdownRow';
import { formatNumber } from '../../utils/formatNumber';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { useDetailsCollapsed } from '../../hooks/useDetailsCollapsed';

interface DesktopProfileModalProps {
  profileId: string;
}

export function DesktopProfileModal({ profileId }: DesktopProfileModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale } = useI18n();
  const { data: profile, isLoading } = useProfile(profileId);
  const { data: breakdown } = usePersonBreakdown(profileId);
  const voteMutation = useVote();
  const { data: me } = useMe();
  const likeAnim = useVoteAnimation();
  const dislikeAnim = useVoteAnimation();
  const animatedLikes = useAnimatedValue(profile?.likes ?? 0);
  const animatedDislikes = useAnimatedValue(profile?.dislikes ?? 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Collapsing drops the description + country breakdown, shrinking this
  // bottom-anchored card so the map behind it is actually usable - at a Full HD
  // viewport the expanded modal leaves only ~40% of the map visible, and the
  // covered part is where most of the voting countries are. Header, sentiment bar
  // and the vote buttons stay, so you can still read and vote while on the map.
  // Persisted: someone who came for the map wants it to stay that way.
  // Shared with the mobile sheet's chevron - same choice, one key.
  const [detailsCollapsed, toggleDetails] = useDetailsCollapsed();
  const { name, description, hasTranslation, showingOriginal, toggle } = useProfileText(profile);

  const hasCountry = me === undefined || !!me.user.countryCode;
  const isRegistered = !!me?.user && me.user.tier !== 'anonymous';
  const noCountryMsg = isRegistered ? t.noCountryWarningRegistered : t.noCountryWarning;
  const canLike = hasCountry && (me?.voteAllowance.like.remaining ?? 0) > 0;
  const canDislike = hasCountry && (me?.voteAllowance.dislike.remaining ?? 0) > 0;
  const likeCountdown = useCountdown(!canLike && hasCountry ? me?.voteAllowance.like.nextAt ?? null : null);
  const dislikeCountdown = useCountdown(!canDislike && hasCountry ? me?.voteAllowance.dislike.nextAt ?? null : null);

  const handleVote = (type: 'like' | 'dislike') => {
    if (!profile) return;
    voteMutation.mutate({ profileId: profile.id, type });
    if (type === 'like') likeAnim.trigger();
    else dislikeAnim.trigger();
  };

  const close = () => navigate('/' + location.search);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Lightbox owns ESC while open; only close the modal otherwise.
      if (e.key === 'Escape' && !lightboxOpen) close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, location.search, lightboxOpen]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end items-center pointer-events-none"
    >
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="bg-surface-light border border-border rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-4 flex flex-col max-h-[calc(100dvh-10rem)] mb-16 overflow-hidden pointer-events-auto" style={{ animation: 'modal-enter 0.25s ease-out' }}>
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-white/50">Loading…</div>
        )}

        {profile && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
              {(() => {
                const state = location.state as {
                  fromUserId?: string; fromUserName?: string;
                  fromCountryCode?: string; fromCountryName?: string;
                } | null;
                if (state?.fromUserId) {
                  return (
                    <Link
                      to={`/u/${state.fromUserId}${location.search}`}
                      title={state.fromUserName ? `← @${state.fromUserName}` : 'Back'}
                      aria-label={state.fromUserName ? `Back to @${state.fromUserName}` : 'Back'}
                      className="text-white/40 hover:text-white/80 transition-colors p-1 -ml-1 shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </Link>
                  );
                }
                if (state?.fromCountryCode) {
                  return (
                    <Link
                      to={`/c/${state.fromCountryCode}${location.search}`}
                      title={state.fromCountryName ? `← ${state.fromCountryName}` : 'Back'}
                      aria-label={state.fromCountryName ? `Back to ${state.fromCountryName}` : 'Back'}
                      className="text-white/40 hover:text-white/80 transition-colors p-1 -ml-1 shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </Link>
                  );
                }
                return null;
              })()}
              <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-14 h-14 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  {/* Stays h1 at every width. Above 1366 MapProfileTitle adds a
                      second h1 over the map carrying the same opinio - deliberate:
                      multiple h1s are valid HTML5 and Google does not rank on their
                      count, and below 1366 there is no map, so keeping this one
                      unconditional is what guarantees the page always has an h1.

                      18px from lg up, a step above the 16 the sidebar cards set
                      their names at: this is the detail view of the same opinio,
                      and at a shared size it read as the smaller of the two - the
                      modal's own agree-% (20) and net badge (18) outranked its
                      title, and the body copy sits at 14 here against 13 in a
                      card, so the title had less room over its own text than a
                      list row does.

                      Below lg it steps down to 15, which is about the header row
                      staying on ONE line rather than about type scale. The modal's
                      max-width is capped at max-w-xl until lg, so that row is 418px
                      at every width from 768 to 1023 - and the flag (20), the role
                      badge (64 for "Politics") and two 6px gaps leave the name 322
                      of it. A 40-char statement - the input cap - measures 324 at
                      16px, so it was already wrapping the badges onto a second line
                      before this size existed; at 15 it measures 304 and fits. The
                      one case still over budget is the longest role label,
                      "Entertainment", on a title at the full 40 chars. */}
                  <h1 className="text-[15px] lg:text-lg font-semibold text-white truncate">{name}</h1>
                  <CountryFlag code={profile.countryCode} />
                  <RoleBadge role={profile.role} />
                </div>
                <p className="text-[11px] text-white/50">
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
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={toggleDetails}
                  title={detailsCollapsed ? t.showDetails : t.hideDetails}
                  aria-label={detailsCollapsed ? t.showDetails : t.hideDetails}
                  aria-expanded={!detailsCollapsed}
                  className="text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${detailsCollapsed ? '' : 'rotate-180'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <ShareButton profileId={profile.id} profileName={profile.name} />
                <ReportProfileButton profileId={profile.id} />
                {me?.user.id && profile.addedById === me.user.id && (
                  <DeleteProfileButton
                    profileId={profile.id}
                    voteCount={profile.likes + profile.dislikes}
                    onDeleted={close}
                  />
                )}
                <button
                  onClick={close}
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

            {/* Body - two columns */}
            <div className="flex-1 overflow-y-auto">
              {/* Live votes as a sentiment bar: green segment = likes' share of
                  the active (24h) votes, red = dislikes'. Replaces the old ▲/▼ counts. */}
              <div className="px-6 pt-4 pb-3 border-b border-border space-y-2.5" style={{ animation: 'stat-in 0.35s ease-out' }}>
                {(() => {
                  const total = animatedLikes + animatedDislikes;
                  const agreePct = total > 0 ? Math.round((animatedLikes / total) * 100) : 0;
                  const net = animatedLikes - animatedDislikes;
                  const netTone = net > 0 ? 'text-positive bg-positive/15' : net < 0 ? 'text-accent bg-accent/15' : 'text-white/50 bg-white/10';
                  return (
                    <>
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
                    </>
                  );
                })()}
              </div>
              {/* Folded away by the header chevron. The height animates on the
                  grid row (see .details-fold in index.css) so it lands on the
                  content's own height rather than a max-height guess, and the
                  layer inside fades and lifts a beat ahead of the box, so the text
                  is gone before the clip edge reaches it. The card is anchored to
                  the bottom of the screen, so folding pulls the whole modal down
                  toward the vote buttons and uncovers the map as it goes. */}
              <div className="details-fold" data-collapsed={detailsCollapsed}>
                <div>
                  <div className="details-fold-inner grid grid-cols-2 gap-0 divide-x divide-border">
                    {/* Left: description first, optional image second as supporting context */}
                    <div className="px-6 py-4 space-y-3">
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
                        // 240 px cap keeps the image as supporting context, not
                        // the focus. Click opens the full 1280 px in the lightbox.
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
                            className="w-full h-auto max-h-[240px] object-contain"
                          />
                        </button>
                      )}
                      {profile.hasLink && (
                        <div>
                          <SourceLink profileId={profile.id} host={profile.linkHost} />
                        </div>
                      )}
                    </div>

                    {/* Right: breakdown. The wrapper is `relative` with its content
                        `absolute inset-0`, so the column contributes no intrinsic
                        height — the grid row is sized by the LEFT (opinion text)
                        column. The lists then scroll to fit that height instead of
                        growing the modal just to list 10 countries. A min-height
                        floor keeps it usable when the opinion text is very short. */}
                    <div className="relative min-h-[200px]">
                      <div className="absolute inset-0 px-6 py-4">
                        {breakdown && (breakdown.topLiking.length > 0 || breakdown.topDisliking.length > 0) ? (
                          <div className="grid grid-cols-2 gap-6 h-full">
                            <div className="flex flex-col min-h-0">
                              <p className="text-[10px] font-bold text-positive uppercase tracking-wider mb-2 shrink-0">▲ {t.breakdownLiking}</p>
                              <div className="flex-1 min-h-0 overflow-y-auto pr-1 subtle-scrollbar">
                                {(() => {
                                  const max = Math.max(1, ...breakdown.topLiking.map(r => r.count));
                                  return breakdown.topLiking.map(({ countryCode, count }, i) => (
                                    <BreakdownRow key={countryCode} countryCode={countryCode} count={count} max={max} index={i} side="like" />
                                  ));
                                })()}
                              </div>
                            </div>
                            <div className="flex flex-col min-h-0">
                              <p className="text-[10px] font-bold text-negative uppercase tracking-wider mb-2 shrink-0">▼ {t.breakdownDisliking}</p>
                              <div className="flex-1 min-h-0 overflow-y-auto pr-1 subtle-scrollbar">
                                {(() => {
                                  const max = Math.max(1, ...breakdown.topDisliking.map(r => r.count));
                                  return breakdown.topDisliking.map(({ countryCode, count }, i) => (
                                    <BreakdownRow key={countryCode} countryCode={countryCode} count={count} max={max} index={i} side="dislike" />
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-white/20">{t.noVotesYet}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - full-width vote buttons */}
            <div className="flex shrink-0 border-t border-border rounded-none">
              <div className="relative flex-1 border-r border-border">
                {likeAnim.particles.map((p) => (
                  <span
                    key={p.id}
                    className="vote-particle text-positive"
                    style={{
                      fontSize: Math.min(0.9 + p.streak * 0.14, 1.6) + 'rem',
                      marginBottom: 8,
                    }}
                  >
                    {p.streak >= 5 ? '🔥' : p.streak >= 3 ? `+${p.streak}` : '+1'}
                  </span>
                ))}
                <button
                  key={likeAnim.bumpKey}
                  onClick={() => handleVote('like')}
                  disabled={!canLike}
                  title={!hasCountry ? noCountryMsg : undefined}
                  className={`vote-bump w-full flex items-center justify-center gap-2.5 py-4 text-base font-semibold transition-colors rounded-none tabular-nums ${
                    canLike
                      ? 'cursor-pointer bg-positive/10 hover:bg-positive/20 text-positive'
                      : 'cursor-not-allowed bg-white/[0.02] text-white/25'
                  }`}
                >
                  <span>▲</span>
                  {!canLike && likeCountdown.text ? (
                    <span className="text-sm font-medium tabular-nums">{t.nextVote} {likeCountdown.text}</span>
                  ) : (
                    <span>{t.agree}</span>
                  )}
                </button>
              </div>
              <div className="relative flex-1">
                {dislikeAnim.particles.map((p) => (
                  <span
                    key={p.id}
                    className="vote-particle text-negative"
                    style={{
                      fontSize: Math.min(0.9 + p.streak * 0.14, 1.6) + 'rem',
                      marginBottom: 8,
                    }}
                  >
                    {p.streak >= 5 ? '💥' : p.streak >= 3 ? `+${p.streak}` : '+1'}
                  </span>
                ))}
                <button
                  key={dislikeAnim.bumpKey}
                  onClick={() => handleVote('dislike')}
                  disabled={!canDislike}
                  title={!hasCountry ? noCountryMsg : undefined}
                  className={`vote-bump w-full flex items-center justify-center gap-2.5 py-4 text-base font-semibold transition-colors rounded-none tabular-nums ${
                    canDislike
                      ? 'cursor-pointer bg-negative/10 hover:bg-negative/20 text-negative'
                      : 'cursor-not-allowed bg-white/[0.02] text-white/25'
                  }`}
                >
                  <span>▼</span>
                  {!canDislike && dislikeCountdown.text ? (
                    <span className="text-sm font-medium tabular-nums">{t.nextVote} {dislikeCountdown.text}</span>
                  ) : (
                    <span>{t.disagree}</span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {lightboxOpen && profile?.contentImageUrl && (
        <ContentImageLightbox
          imageUrl={profile.contentImageUrl}
          alt={profile.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
