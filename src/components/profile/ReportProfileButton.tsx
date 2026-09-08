import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalShell } from '../common/ModalShell';
import { IconTip } from '../common/IconTip';
import { useI18n } from '../../i18n/I18nContext';
import { useReportProfile } from '../../hooks/useReports';

interface ReportProfileButtonProps {
  profileId: string;
}

const FlagIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21V4m0 0h13l-2 4 2 4H5.5" />
  </svg>
);

export function ReportProfileButton({ profileId }: ReportProfileButtonProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const { mutateAsync, isPending } = useReportProfile();

  const close = () => {
    setOpen(false);
    setReason('');
    setDone(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await mutateAsync({ profileId, reason: reason.trim() });
      setDone(true);
      // Brief confirmation, then dismiss.
      setTimeout(close, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <>
      <IconTip label={t.report}>
        <button
          onClick={() => setOpen(true)}
          aria-label={t.report}
          className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0"
        >
          <FlagIcon />
        </button>
      </IconTip>

      {open && createPortal(
        <ModalShell
          onClose={close}
          title={t.reportTitle}
          icon={<FlagIcon className="w-5 h-5 text-white/40" />}
        >
          {done ? (
            <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">✓</span>
              <p className="text-sm text-white/70">{t.reportThanks}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">{t.reportReasonLabel}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.reportReasonPlaceholder}
                  rows={4}
                  maxLength={999}
                  required
                  autoFocus
                  className="w-full text-white text-sm rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-accent bg-transparent placeholder:text-white/25 resize-none"
                />
                <p className="text-xs text-white/25 text-right mt-0.5">{reason.length}/999</p>
              </div>

              {error && <p className="text-xs text-negative">{error}</p>}

              <button
                type="submit"
                disabled={isPending || reason.trim().length < 5}
                className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? t.reportSubmitting : t.reportSubmit}
              </button>
            </form>
          )}
        </ModalShell>,
        document.body,
      )}
    </>
  );
}
