import type { Role } from '../../types/profile';
import { ROLE_COLORS } from '../../utils/roles';
import { useI18n } from '../../i18n/I18nContext';

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useI18n();

  return (
    <span
      className={`${ROLE_COLORS[role]} text-white text-[11px] leading-none font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide`}
    >
      {t.roles[role]}
    </span>
  );
}
