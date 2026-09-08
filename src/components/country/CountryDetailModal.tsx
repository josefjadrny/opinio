import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { useI18n } from '../../i18n/I18nContext';
import { useCountries } from '../../hooks/useCountries';
import { useCountryDiscussed } from '../../hooks/useCountryDiscussed';
import { useMapPanel } from '../../context/useMapPanel';
import { useCountryDetailsCollapsed } from '../../hooks/useDetailsCollapsed';
import { getCountryName, isKnownCountry } from '../../utils/countries';
import { formatNumber } from '../../utils/formatNumber';
import { FlagImg } from '../common/CountryFlag';
import { IconTip } from '../common/IconTip';
import { VoteStat } from '../common/VoteStat';
import { ProfileList } from '../profile/ProfileList';

interface CountryDetailModalProps {
  countryCode: string;
}

function ShareCountryButton({ code, name }: { code: string; name: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const url = `${window.location.origin}/c/${code}`;
    const title = `${name} - Opinio`;
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
    <IconTip label={copied ? t.linkCopied : t.share}>
      <button
        onClick={handleShare}
        aria-label={t.share}
        className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0"
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

export function CountryDetailModal({ countryCode }: CountryDetailModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, locale } = useI18n();

  const code = countryCode.toUpperCase();
  const notFound = !isKnownCountry(code);
  const name = getCountryName(code, locale);
  const { data } = useCountries();
  const counts = data?.countries.find((c) => c.code === code) ?? { likes: 0, dislikes: 0 };
  // Skip the discussed fetch for an unknown code - there's nothing to load and
  // the API would just 404.
  const { data: countryData, isLoading: profilesLoading } = useCountryDiscussed(notFound ? '' : code);
  const profiles = countryData?.profiles ?? [];

  // Which country is on screen, for the mobile map panel above (the desktop map
  // reads the route directly - it is one component away from this modal). The
  // panel tints to it and rings it while this sheet is showing, and hands itself
  // back to global sentiment on unmount. An unknown code registers nothing:
  // there is no data to tint with, and the sheet is showing its not-found state.
  const { registerCountrySheet } = useMapPanel();
  useEffect(() => {
    if (notFound) return;
    registerCountrySheet(code);
    return () => registerCountrySheet(null);
  }, [code, notFound, registerCountrySheet]);

  // Close preserves the URL's query as-is. Opening this modal never touches the
  // feed's country filter, by any route in - map click, breakdown row, /c/ link
  // or pasted URL. Only the FilterBar sets that, so what the reader chose is
  // still there when the modal closes.
  const close = () => navigate('/' + location.search);
  // Shared between this modal's mobile sheet and desktop card - same choice, one
  // key - exactly as the profile modal's chevron is.
  const [detailsCollapsed, toggleDetails] = useCountryDetailsCollapsed();
  const { sheetRef, dragHandlers } = useSheetDrag(close);
  const openProfile = (profileId: string) => navigate('/p/' + profileId + location.search, {
    state: { fromCountryCode: code, fromCountryName: name },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Visible h1 - reuse the localized country title (drop the " - Opinio" brand
  // suffix). A real, catchy, keyword-front-loaded heading in place of the bare
  // country name (which "said nothing"). Wraps rather than truncates.
  const countryH1 = t.seo.country.title
    .replace(/\{country\}/g, name)
    .replace(/\s*-\s*Opinio\s*$/, '');

  const Header = (
    <>
      <FlagImg code={code} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-white leading-tight">{countryH1}</h1>
        <p className="text-[11px] text-white/50 uppercase tracking-wider">{code}</p>
      </div>
      <VoteStat
        likes={counts.likes}
        dislikes={counts.dislikes}
        label={t.statsVotes}
        title={`${formatNumber(counts.likes)} likes · ${formatNumber(counts.dislikes)} dislikes`}
      />
    </>
  );

  // Folds the opinio list away, leaving the header over an unobstructed map -
  // the profile modal's header chevron, for the same reason and with the same
  // control. A country with 15 opinios makes a card tall enough to cover most of
  // the map, and the map is now tinted to THIS country, so the thing being
  // covered is the answer to the question the page asks. Same icon, same
  // rotation, same title strings, same fold animation; only the storage key
  // differs (see useCountryDetailsCollapsed).
  //
  // Hidden when the code is unknown: the not-found card has nothing worth
  // folding, and the map behind it is untinted anyway.
  const CollapseButton = (
    <IconTip label={detailsCollapsed ? t.showDetails : t.hideDetails}>
      <button
        onClick={toggleDetails}
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
    </IconTip>
  );

  // Same button in the sheet's header and the desktop card's - one definition so
  // the two cannot drift apart.
  const CloseButton = (
    <IconTip label={t.close}>
      <button onClick={close} aria-label={t.close} className="text-white/40 hover:text-white/80 transition-colors p-1">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </IconTip>
  );

  const NotFoundLabel = (
    <span className="text-sm font-semibold text-white/60 flex-1">{t.countryNotFoundLabel}</span>
  );

  const NotFoundView = (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 3.75-5.5 3.75-9S14.5 5.5 12 3m0 18c-2.5-2.5-3.75-5.5-3.75-9S9.5 5.5 12 3M3.6 9h16.8M3.6 15h16.8" />
        </svg>
      </div>
      <p className="text-base font-semibold text-white mb-1">{t.countryNotFoundTitle}</p>
      <p className="text-sm text-white/50 mb-5 max-w-xs">{t.countryNotFoundBody}</p>
      <button
        onClick={close}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
      >
        {t.countryNotFoundCta}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      // Starts BELOW the map panel (--mobile-map-panel-bottom, published by
      // MobileMapPanel), which is what the profile sheet does and what this one
      // now needs too: the panel above is tinted to THIS country and rings it,
      // and a sheet whose backdrop covers the whole screen left that map dimmed
      // behind a scrim and its grab bar untappable - the tint was unreachable on
      // mobile unless the panel happened to be open already.
      //
      // The scrim itself is kept (unlike the profile sheet, which dropped it):
      // it is what makes tap-outside close this sheet, and here "outside" is now
      // only the feed below the map, not the map.
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex flex-col justify-end"
        style={{ top: 'var(--mobile-map-panel-bottom, 0px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={close} />
        {/* max-h-full, not a vh figure - the same trap ModalShell documents. The
            wrapper now starts below the map panel, so an 85vh sheet is taller
            than the box holding it and `justify-end` lets it overflow UPWARD,
            straight back over the map it was just moved off. Bounding it by the
            container makes the wrapper's top the only thing deciding where it
            starts. */}
        {/* pb-11 reserves the votes bar's strip on the SHEET, not on the folded
            body: the bar sits above every sheet (z-90) and the reservation has to
            survive the fold, or collapsing leaves the header itself underneath
            it. That is where the bottom padding used to be. */}
        <div
          key={code}
          ref={sheetRef}
          className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-full flex flex-col pb-11"
          style={{ animation: 'modal-enter 0.28s ease-out' }}
        >
          <div className="flex justify-center pt-3 pb-1 shrink-0" {...dragHandlers}>
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0" {...dragHandlers}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {notFound ? NotFoundLabel : Header}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {!notFound && CollapseButton}
              {!notFound && <ShareCountryButton code={code} name={name} />}
              {CloseButton}
            </div>
          </div>
          {/* Collapsing to 0fr animates the SHEET's height, which a max-height
              cannot do without a magic number that is wrong for every other
              country. .details-fold (index.css) owns that, plus the min-h-0 +
              overflow-hidden the clipped child must carry or the content refuses
              to be squeezed. Shared with the profile sheet, so both fold at one
              speed. min-h-0 on the fold itself keeps it a well-behaved flex child
              inside the max-h-full sheet. */}
          <div className="details-fold min-h-0" data-collapsed={detailsCollapsed}>
            <div>
              <div className="details-fold-inner overflow-y-auto overscroll-y-contain max-h-[60vh] px-4 pt-4 pb-4 space-y-4">
                {notFound ? NotFoundView : (
                  <ProfileList
                    profiles={profiles}
                    label={t.userReportedProfiles}
                    emptyText={t.noProfiles}
                    loading={profilesLoading}
                    loadingText={t.loading}
                    onOpen={openProfile}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      {/* Same entrance as DesktopProfileModal, at the same duration: the two
          cards occupy the same slot and swap between each other (a map click
          opens this one, a row in it opens that one), so one arriving without
          the rise the other has reads as a glitch rather than a difference.

          key={code} is what makes it replay when you move from one country to
          the next. A CSS animation runs once per mount, and /c/DE -> /c/FR is
          the SAME route with a different param, so React keeps the instance and
          the card would just swap its contents instantly - measured, the opacity
          never left 1. The profile modal happens to replay for a reason this one
          does not have: switching opinios unmounts it while the new profile
          query is in flight. A country needs no fetch to render its header
          (getCountryName is local), so there is no gap to remount in and the key
          has to say so explicitly. Clicking around the map is exactly this
          path, which is why the entrance looked missing. */}
      <div
        key={code}
        className="bg-surface-light border border-border rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-4 flex flex-col max-h-[calc(100dvh-10rem)] mb-16 overflow-hidden pointer-events-auto"
        style={{ animation: 'modal-enter 0.25s ease-out' }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
          {notFound ? NotFoundLabel : Header}
          <div className="flex items-center gap-1 shrink-0">
            {!notFound && CollapseButton}
            {!notFound && <ShareCountryButton code={code} name={name} />}
            {CloseButton}
          </div>
        </div>
        {/* Same fold as the mobile sheet and as both profile modals. The card is
            anchored to the bottom of the screen (justify-end + mb-16), so folding
            pulls it DOWN and uncovers the map from the top - which is where the
            countries doing the voting are. */}
        <div className="details-fold min-h-0" data-collapsed={detailsCollapsed}>
          <div>
            {/* Five rows, then scroll - the card must not grow to list all 15,
                because what it grows over is the map, and on this route the map
                is the answer to the question the page asks.
                420px is that arithmetic: 16px top padding + a 25px list label +
                five 66px rows on a 4px rhythm (346px) comes to 387, and the
                remainder leaves a sliver of the sixth row showing, which is what
                says "this scrolls" without a scrollbar having to.
                The dvh term keeps it honest on a short window, where five rows
                would be taller than the room the card has: whichever is smaller
                wins. subtle-scrollbar matches the opinio modal's lists. */}
            <div className="details-fold-inner overflow-y-auto subtle-scrollbar max-h-[min(420px,calc(100dvh-16rem))] px-6 py-4">
              {notFound ? NotFoundView : (
                <ProfileList
                  profiles={profiles}
                  label={t.userReportedProfiles}
                  emptyText={t.noProfiles}
                  loading={profilesLoading}
                  loadingText={t.loading}
                  onOpen={openProfile}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
