import { useEffect, type ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ModalShellProps {
  onClose: () => void;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  desktopScrollable?: boolean;
}

export function ModalShell({
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = 'max-w-sm',
  desktopScrollable = false,
}: ModalShellProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const closeBtn = (
    <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors p-1">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 top-[63px] z-[70] flex flex-col justify-end"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-surface border-t border-border rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="text-base font-semibold text-white">{title}</h2>
            </div>
            {closeBtn}
          </div>
          <div className="flex-1 overflow-y-auto">
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
      className="fixed inset-0 z-20 flex items-start justify-center pt-12 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-surface border border-border rounded-2xl shadow-2xl w-full ${maxWidth} mx-4 ${desktopScrollable ? 'max-h-[80vh] flex flex-col' : ''}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b border-border ${desktopScrollable ? 'shrink-0' : ''}`}>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold text-white">{title}</h2>
          </div>
          {closeBtn}
        </div>
        {desktopScrollable ? (
          <div className="overflow-y-auto flex-1">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
