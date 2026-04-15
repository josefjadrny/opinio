import { useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const content = (
    <div className="px-6 py-5 space-y-5">
      {/* Branding */}
      <div className="flex items-center gap-3 pb-1">
        <img src="/favicon.svg" alt="Opinio" className="w-10 h-10" />
        <span className="text-2xl font-bold text-accent tracking-tight">{t.appName}</span>
      </div>

      <div className="border-t border-border" />

      {/* What is Opinio */}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-white">{t.aboutWhatTitle}</p>
        <p className="text-sm text-white/60 leading-relaxed">{t.aboutWhatBody}</p>
      </div>

      <div className="border-t border-border" />

      {/* No ads */}
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">🚫</span>
        <p className="text-sm text-white/60 leading-relaxed">{t.aboutNoAds}</p>
      </div>

      {/* Fresh data */}
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">⏱</span>
        <p className="text-sm text-white/60 leading-relaxed">{t.aboutFreshData}</p>
      </div>

      <div className="border-t border-border" />

      {/* Tiers */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">{t.aboutTiersTitle}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{t.aboutTierAnonymous}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/50">1 {t.aboutVotesPerHour}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{t.aboutTierRegistered}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">3 {t.aboutVotesPerHour}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-white/60">
              {t.aboutTierSupporter}
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white/10 text-white/40 border border-white/10">{t.comingSoon}</span>
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-positive/20 text-positive">5 {t.aboutVotesPerHour}</span>
          </div>
        </div>
        <p className="text-xs text-white/30 mt-3">{t.aboutVoteExpiry}</p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <h2 className="text-base font-semibold text-white">{t.about}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-start justify-center pt-12 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-white">{t.about}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}
