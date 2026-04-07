import { useI18n } from '../../i18n/I18nContext';

export function NewBadge() {
  const { t } = useI18n();
  return (
    <span className="bg-cyan-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
      {t.newBadge}
    </span>
  );
}
