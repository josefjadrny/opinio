import { useNavigate, useLocation } from 'react-router-dom';
import { ModalShell } from '../common/ModalShell';
import { useI18n } from '../../i18n/I18nContext';

interface PrivacyModalProps {
  onClose: () => void;
}

const PrivacyIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
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

export function PrivacyModal({ onClose }: PrivacyModalProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ModalShell onClose={onClose} title={t.privacy} icon={<PrivacyIcon />} maxWidth="max-w-2xl" desktopScrollable>
      <div className="px-6 py-5 space-y-5">
        <p className="text-xs text-white/40">{t.privacyLastUpdated}</p>

        <Section title={t.privacyOperatorTitle}>
          <p>{t.privacyOperatorBody}</p>
        </Section>

        <Section title={t.privacyDataTitle}>
          <p>{t.privacyDataBody}</p>
        </Section>

        <Section title={t.privacyWhyTitle}>
          <p>{t.privacyWhyBody}</p>
        </Section>

        <Section title={t.privacyCookiesTitle}>
          <p>{t.privacyCookiesBody}</p>
        </Section>

        <Section title={t.privacyThirdPartiesTitle}>
          <p>{t.privacyThirdPartiesBody}</p>
        </Section>

        <Section title={t.privacyRetentionTitle}>
          <ul className="space-y-1">
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.privacyRetentionVotes}</span></li>
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.privacyRetentionProfiles}</span></li>
            <li className="flex gap-2"><span className="text-accent shrink-0">·</span><span>{t.privacyRetentionAccounts}</span></li>
          </ul>
        </Section>

        <Section title={t.privacyRightsTitle}>
          <p>{t.privacyRightsBody}</p>
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
