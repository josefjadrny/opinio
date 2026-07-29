import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModalShell } from '../common/ModalShell';
import { BulletItem } from '../common/BulletItem';
import { useI18n } from '../../i18n/I18nContext';

interface TermsModalProps {
  onClose: () => void;
}

const TermsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M9 8h3" />
  </svg>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <div className="text-sm text-white/60 leading-relaxed space-y-1.5">{children}</div>
    </div>
  );
}

const SUPPORT_EMAIL = 'support@opinio.live';

function renderTokens(text: string, tokens: Record<string, ReactNode>) {
  const parts = text.split(/(\{[a-z]+\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{([a-z]+)\}$/);
    if (m && tokens[m[1]] !== undefined) return <span key={i}>{tokens[m[1]]}</span>;
    return <span key={i}>{part}</span>;
  });
}

export function TermsModal({ onClose }: TermsModalProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const emailLink = (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="text-positive hover:text-positive/80 transition-colors"
    >
      {SUPPORT_EMAIL}
    </a>
  );

  const supportLink = (
    <button
      type="button"
      onClick={() => navigate('/support' + location.search)}
      className="text-accent hover:text-accent/80 transition-colors"
    >
      {t.aboutPrinciplePrivacyContactLink}
    </button>
  );

  return (
    <ModalShell onClose={onClose} title={t.terms} titleAs="h1" icon={<TermsIcon />} maxWidth="max-w-2xl" desktopScrollable>
      <div className="px-6 py-5 space-y-5">
        <p className="text-xs text-white/40">{t.termsLastUpdated}</p>

        <Section title={t.termsOperatorTitle}>
          <p>
            {renderTokens(t.termsOperatorBody, {
              operator: <span className="text-white/80 font-medium">{t.privacyOperatorName}</span>,
              email: emailLink,
            })}
          </p>
        </Section>

        <Section title={t.termsAcceptTitle}>
          <p>{t.termsAcceptBody}</p>
        </Section>

        <Section title={t.termsRulesTitle}>
          <p>{t.termsRulesIntro}</p>
          <ul className="space-y-2 mt-1.5">
            <BulletItem><span className="text-white/80">{t.termsRuleViolentTitle}.</span>{' '}{t.termsRuleViolentBody}</BulletItem>
            <BulletItem><span className="text-white/80">{t.termsRuleHarassmentTitle}.</span>{' '}{t.termsRuleHarassmentBody}</BulletItem>
            <BulletItem><span className="text-white/80">{t.termsRuleNudityTitle}.</span>{' '}{t.termsRuleNudityBody}</BulletItem>
            <BulletItem><span className="text-white/80">{t.termsRuleImpersonationTitle}.</span>{' '}{t.termsRuleImpersonationBody}</BulletItem>
            <BulletItem><span className="text-white/80">{t.termsRuleIllegalTitle}.</span>{' '}{t.termsRuleIllegalBody}</BulletItem>
            <BulletItem><span className="text-white/80">{t.termsRuleSpamTitle}.</span>{' '}{t.termsRuleSpamBody}</BulletItem>
          </ul>
        </Section>

        <Section title={t.termsBlockTitle}>
          <p>{t.termsBlockBody}</p>
        </Section>

        <Section title={t.termsImageUploadsTitle}>
          <p>{t.termsImageUploadsBody}</p>
        </Section>

        <Section title={t.termsVotingTitle}>
          <p>{t.termsVotingBody}</p>
        </Section>

        <Section title={t.termsSubscriptionTitle}>
          <p>{t.termsSubscriptionBody}</p>
        </Section>

        <Section title={t.termsLiabilityTitle}>
          <p>{t.termsLiabilityBody}</p>
        </Section>

        <Section title={t.termsChangesTitle}>
          <p>{t.termsChangesBody}</p>
        </Section>

        <Section title={t.termsContactTitle}>
          <p>{renderTokens(t.termsContactBody, { email: emailLink, support: supportLink })}</p>
          <button
            type="button"
            onClick={() => navigate('/support' + location.search)}
            className="inline-block mt-2 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            {t.privacyOpenSupport} →
          </button>
        </Section>
      </div>
    </ModalShell>
  );
}
