import { Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModalShell } from '../common/ModalShell';
import { useI18n } from '../../i18n/I18nContext';

interface AboutModalProps {
  onClose: () => void;
}

function withVoteIcons(text: string): React.ReactNode[] {
  return text.split(/(▲|▼)/).map((part, i) => {
    if (part === '▲') return <span key={i} className="text-positive font-medium">▲</span>;
    if (part === '▼') return <span key={i} className="text-negative font-medium">▼</span>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const AboutIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
  </svg>
);

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ModalShell onClose={onClose} title={t.about} icon={<AboutIcon />} maxWidth="max-w-md">
      <div className="px-6 py-5 space-y-5">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Opinio" className="w-10 h-10" />
          <span className="text-2xl font-bold text-accent tracking-tight">{t.appName}</span>
        </div>

        {/* Hero */}
        <p className="text-sm text-white leading-relaxed">{t.aboutHero}</p>

        {/* Freshness */}
        <p className="text-sm text-white/60 leading-relaxed">{t.aboutFreshness}</p>

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
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm text-white/60 min-w-0">
                <span className="shrink-0">{t.aboutTierSupporter}</span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white/10 text-white/40 border border-white/10 shrink-0">
                  {t.comingSoon} · {t.aboutSupporterPriceNote}
                </span>
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-positive/20 text-positive shrink-0">5 {t.aboutVotesPerHour}</span>
            </div>
          </div>
          <p className="text-xs text-white/30 mt-3">{withVoteIcons(t.aboutVoteExpiry)}</p>
        </div>

        <div className="border-t border-border" />

        {/* Principles */}
        <div>
          <p className="text-sm font-semibold text-white mb-2">{t.aboutPrinciplesTitle}</p>
          <ul className="space-y-1.5 text-sm text-white/60">
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.aboutPrincipleNoAds}</span></li>
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.aboutPrincipleNoSharing}</span></li>
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.aboutPrincipleNoTweaks}</span></li>
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.aboutPrincipleDataDeletion}</span></li>
          </ul>
        </div>

        <div className="border-t border-border" />

        {/* Footer */}
        <div className="space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/40">
            <span>🇨🇿 {t.aboutMadeInCzechia}</span>
            <span>·</span>
            <span>🇩🇪 {t.aboutHostedInGermany}</span>
            <span>·</span>
            <span>🇪🇺 {t.aboutEuOrigin}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => navigate('/privacy' + location.search)}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              {t.privacy}
            </button>
            <span className="text-white/30">·</span>
            <a
              href="https://github.com/josefjadrny/opinio-fe"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              {t.aboutSourceLink}
            </a>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
