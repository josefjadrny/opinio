import { Fragment, type ReactNode } from 'react';
import { ModalShell } from '../common/ModalShell';
import { useI18n } from '../../i18n/I18nContext';

interface AboutModalProps {
  onClose: () => void;
}

function withVoteIcons(text: string): ReactNode[] {
  return text.split(/(▲|▼)/).map((part, i) => {
    if (part === '▲') return <span key={i} className="text-positive font-medium">▲</span>;
    if (part === '▼') return <span key={i} className="text-negative font-medium">▼</span>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const AboutIcon = () => (
  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useI18n();
  const aboutFreshDataText = t.aboutFreshData.replace(/[❤♥]/g, '').trim();
  const aboutFreshDataParts = aboutFreshDataText.split('Opinio');

  return (
    <ModalShell onClose={onClose} title={t.about} icon={<AboutIcon />} maxWidth="max-w-lg">
      <div className="px-6 py-5 space-y-5">
        {/* Branding */}
        <div className="flex items-center gap-3 pb-1">
          <img src="/favicon.svg" alt="Opinio" className="w-10 h-10" />
          <span className="text-2xl font-bold text-accent tracking-tight">{t.appName}</span>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-white">{t.aboutWhatTitle}</p>
          <p className="text-sm text-white/60 leading-relaxed">
            {t.aboutWhatBodyLead}{' '}
            <span className="text-white/85 font-medium">{t.aboutWhatBodyEmphasisPart1}</span>
            {' '}{t.aboutWhatBodyEmphasisConnector}{' '}
            <span className="text-white/85 font-medium">{t.aboutWhatBodyEmphasisPart2}</span>
          </p>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">{t.aboutNoAds}</p>
          <p className="text-sm text-white/60 leading-relaxed">
            {aboutFreshDataParts.map((part, index) => (
              <Fragment key={`${part}-${index}`}>
                {part}
                {index < aboutFreshDataParts.length - 1 && <span className="text-negative font-medium">Opinio</span>}
              </Fragment>
            ))}
            {' '}
            <span className="text-negative">❤</span>
          </p>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">
            {t.aboutOpenSourceTitle}{' '}
            <span className="text-white font-semibold">{t.aboutOpenSourceTitleEmphasis}</span>
          </p>
          <p className="text-sm text-white/60 leading-relaxed">{t.aboutOpenSourceBody}</p>
          <div className="flex flex-col gap-1.5 pt-1">
            <a
              href="https://github.com/josefjadrny/opinio-fe"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {t.aboutFrontendRepo}
            </a>
            <a
              href="https://github.com/josefjadrny/opinio-api"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {t.aboutBackendRepo}
            </a>
          </div>
        </div>

        <div className="border-t border-border" />

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
          <p className="text-xs text-white/30 mt-3">{withVoteIcons(t.aboutVoteExpiry)}</p>
        </div>

        <div className="border-t border-border" />

        <p className="text-xs text-white/40">
          🇪🇺 {t.aboutEuProject} · 🇨🇿 {t.aboutMadeInCzechia} · 🇩🇪 {t.aboutHostedInGermany}
        </p>
      </div>
    </ModalShell>
  );
}
