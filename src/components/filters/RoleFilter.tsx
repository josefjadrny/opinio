import { ALL_ROLES } from '../../utils/roles';
import { useFilters } from '../../context/FilterContext';
import { useI18n } from '../../i18n/I18nContext';

export function RoleFilter() {
  const { role, setRole } = useFilters();
  const { t } = useI18n();

  return (
    <select
      value={role ?? ''}
      onChange={(e) => setRole((e.target.value || undefined) as typeof role)}
      className="bg-surface-light text-text-primary text-sm rounded-lg border border-border px-3 py-1.5 focus:outline-none focus:border-accent"
    >
      <option value="">{t.allRoles}</option>
      {ALL_ROLES.map((r) => (
        <option key={r} value={r}>{t.roles[r]}</option>
      ))}
    </select>
  );
}
