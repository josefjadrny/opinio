import { useEffect, type ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { useI18n } from '../../i18n/I18nContext';

interface ModalShellProps {
  onClose: () => void;
  title: string;
  // Heading level for the title. Page-level modals (routes like /about, /stats)
  // pass 'h1' so the page owns a single top-level heading; stacked sub-dialogs
  // (confirm, report) keep the default 'h2' to avoid a second h1 on the page.
  titleAs?: 'h1' | 'h2';
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  desktopScrollable?: boolean;
  centered?: boolean;
}

export function ModalShell({
  onClose,
  title,
  titleAs = 'h2',
  icon,
  children,
  footer,
  maxWidth = 'max-w-sm',
  desktopScrollable = false,
  centered = false,
}: ModalShellProps) {
  const TitleTag = titleAs;
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const { sheetRef, dragHandlers } = useSheetDrag(onClose);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const closeBtn = (
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
  );

  if (isMobile) {
    return (
      <div
        className="safe-sheet-top fixed inset-x-0 bottom-0 z-[80] flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div ref={sheetRef} className="safe-bottom-sheet relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1 shrink-0" {...dragHandlers}>
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0" {...dragHandlers}>
            <div className="flex items-center gap-2">
              {icon}
              <TitleTag className="text-base font-semibold text-white">{title}</TitleTag>
            </div>
            {closeBtn}
          </div>
          <div className="flex-1 overflow-y-auto overscroll-y-contain">
            {children}
          </div>
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[80] flex justify-center bg-black/50 ${centered ? 'items-center' : 'items-start pt-12'}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-surface border border-border rounded-2xl shadow-2xl w-full ${maxWidth} mx-4 ${desktopScrollable || footer ? 'max-h-[80vh] flex flex-col' : ''}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b border-border ${desktopScrollable || footer ? 'shrink-0' : ''}`}>
          <div className="flex items-center gap-2">
            {icon}
            <TitleTag className="text-base font-semibold text-white">{title}</TitleTag>
          </div>
          {closeBtn}
        </div>
        {desktopScrollable || footer ? (
          <div className="overflow-y-auto flex-1">{children}</div>
        ) : (
          children
        )}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
