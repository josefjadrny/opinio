import { useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { useI18n } from '../../i18n/I18nContext';

interface ProfileNotFoundModalProps {
  onClose: () => void;
}

// Shown for /p/:id when the id is a genuine 404 (expired or bad link). Mirrors
// the country/user not-found pattern: a friendly view inside a modal shell with
// a close button, rather than an empty card or a perpetual spinner.
export function ProfileNotFoundModal({ onClose }: ProfileNotFoundModalProps) {
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const { sheetRef, dragHandlers } = useSheetDrag(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const CloseButton = (
    <button onClick={onClose} title={t.close} aria-label={t.close} className="text-white/40 hover:text-white/80 transition-colors p-1">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  const Body = (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <p className="text-base font-semibold text-white mb-1">{t.profileNotFoundTitle}</p>
      <p className="text-sm text-white/50 mb-5 max-w-xs">{t.profileNotFoundBody}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
      >
        {t.profileNotFoundCta}
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div ref={sheetRef} className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1 shrink-0" {...dragHandlers}>
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0" {...dragHandlers}>
            <span className="text-sm font-semibold text-white/60">{t.profileNotFoundLabel}</span>
            {CloseButton}
          </div>
          {Body}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="bg-surface-light border border-border rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col mb-16 overflow-hidden pointer-events-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <span className="text-sm font-semibold text-white/60">{t.profileNotFoundLabel}</span>
          {CloseButton}
        </div>
        {Body}
      </div>
    </div>
  );
}
