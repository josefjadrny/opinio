import { useState, useRef, useEffect } from 'react';
import { ALL_ROLES, ROLE_COLORS } from '../../utils/roles';
import { useFilters } from '../../context/useFilters';
import { useI18n } from '../../i18n/I18nContext';
import type { Role } from '../../types/profile';

export function RoleFilter() {
  const { roles, toggleRole, setRoles } = useFilters();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [open]);

  const label = roles.length === 0
    ? t.allCategories
    : roles.length === 1
    ? t.roles[roles[0]]
    : `${roles.length} categories`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 bg-surface-light text-text-primary text-sm rounded-lg border border-border px-3 py-1.5 focus:outline-none focus:border-accent min-w-[8rem] max-w-[11rem]"
      >
        {roles.length === 1 ? (
          <span className={`${ROLE_COLORS[roles[0]]} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide`}>
            {t.roles[roles[0]]}
          </span>
        ) : (
          <span className={`flex-1 text-left truncate ${roles.length > 0 ? 'text-accent' : 'text-text-primary/70'}`}>
            {label}
          </span>
        )}
        <svg className={`w-3 h-3 shrink-0 text-white/40 transition-transform ml-auto ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-surface border border-border rounded-xl shadow-2xl p-3 w-56">
          <div className="flex flex-wrap gap-1.5">
            {ALL_ROLES.map((r: Role) => {
              const active = roles.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleRole(r)}
                  className={`${ROLE_COLORS[r]} text-white text-[11px] leading-none font-semibold px-2 py-1 rounded-full uppercase tracking-wide transition-opacity ${
                    active || roles.length === 0 ? 'opacity-100' : 'opacity-35'
                  } hover:opacity-80`}
                >
                  {t.roles[r]}
                </button>
              );
            })}
          </div>
          {roles.length > 0 && (
            <button
              onClick={() => { setRoles([]); setOpen(false); }}
              className="mt-2.5 w-full text-xs text-white/50 hover:text-white/70 transition-colors text-center"
            >
              {t.clearSelection}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
