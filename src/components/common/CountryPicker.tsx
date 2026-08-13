import { useState, useRef, useEffect, useMemo } from 'react';
import { getCountriesList } from '../../utils/countries';
import { FlagImg } from './CountryFlag';
import { useI18n } from '../../i18n/I18nContext';

// One country chooser for the whole app. Before this, the landing filter, the
// mobile filter sheet and Settings each had their own - two of them with
// hardcoded English strings, and Settings with a native <select> that offered
// no search at all. Arrow keys + Enter work everywhere the list appears.

interface CountrySearchListProps {
  value: string | null | undefined;
  onPick: (code: string | undefined) => void;
  // Renders a leading "All countries" row that clears the selection.
  allowClear?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
  listClassName?: string;
}

export function CountrySearchList({
  value,
  onPick,
  allowClear = false,
  autoFocus = false,
  onEscape,
  listClassName = 'max-h-56',
}: CountrySearchListProps) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const countries = getCountriesList(locale);
  // Prefix match first (typing "ge" should reach Germany, not Algeria), then
  // the remaining substring hits so a mid-word search still finds something.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    const starts = countries.filter((c) => c.name.toLowerCase().startsWith(q));
    const contains = countries.filter(
      (c) => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q)
    );
    return [...starts, ...contains];
  }, [countries, query]);

  // Rows are the filtered countries, optionally preceded by the clear row.
  const rows: Array<{ code?: string; label: string }> = [
    ...(allowClear && !query ? [{ label: t.allCountries }] : []),
    ...filtered.map((c) => ({ code: c.code, label: c.name })),
  ];

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onEscape?.(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[activeIndex];
      if (row) onPick(row.code);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.countrySearchPlaceholder}
        aria-label={t.countrySearchPlaceholder}
        className="w-full bg-white/5 text-white text-sm rounded-lg px-2.5 py-1.5 focus:outline-none placeholder:text-white/50"
      />
      <div ref={listRef} className={`overflow-y-auto py-1 ${listClassName}`}>
        {rows.map((row, i) => {
          const selected = row.code ? value === row.code : !value;
          return (
            <button
              key={row.code ?? '__all'}
              data-row={i}
              onClick={() => onPick(row.code)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                i === activeIndex ? 'bg-white/5' : ''
              } ${selected ? 'text-accent' : row.code ? 'text-white/80' : 'text-white/60'}`}
            >
              {row.code && <FlagImg code={row.code} className="shrink-0 inline-block align-middle" />}
              <span className="truncate">{row.label}</span>
            </button>
          );
        })}
        {rows.length === 0 && (
          <p className="px-3 py-2 text-sm text-white/50 text-center">{t.noMatches}</p>
        )}
      </div>
    </div>
  );
}

interface CountryPickerProps {
  value: string | null | undefined;
  onChange: (code: string | undefined) => void;
  allowClear?: boolean;
  disabled?: boolean;
  // Text shown when nothing is selected.
  placeholder?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

export function CountryPicker({
  value,
  onChange,
  allowClear = false,
  disabled = false,
  placeholder,
  // Defaults mirror SelectField (the language <select> right below it in
  // Settings) so the two form rows read as the same control.
  buttonClassName = 'w-full bg-surface text-white text-sm rounded-lg border border-border pl-3 pr-9 py-2 focus:outline-none focus:border-accent',
  menuClassName = 'w-full',
}: CountryPickerProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = getCountriesList(locale).find((c) => c.code === value);

  // In the mobile settings sheet the field sits near the bottom, where a
  // downward menu is clipped by the sheet edge and the floating votes bar.
  // Measure at open time and flip upward when there is no room below.
  const MENU_HEIGHT = 260;
  const toggle = () => {
    if (disabled) return;
    setOpen((wasOpen) => {
      if (!wasOpen) {
        const rect = ref.current?.getBoundingClientRect();
        const below = rect ? window.innerHeight - rect.bottom : Infinity;
        setDropUp(below < MENU_HEIGHT && (rect?.top ?? 0) > below);
      }
      return !wasOpen;
    });
  };

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={open}
        className={`relative flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        {selected ? (
          <>
            <FlagImg code={selected.code} className="shrink-0 inline-block align-middle" />
            <span className="truncate flex-1 text-left">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-text-primary/70 truncate">{placeholder ?? t.allCountries}</span>
        )}
        <svg className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`absolute left-0 z-50 bg-surface border border-border rounded-xl shadow-2xl p-2 pb-0 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} ${menuClassName}`}>
          <CountrySearchList
            value={value}
            allowClear={allowClear}
            autoFocus
            onEscape={() => setOpen(false)}
            onPick={(code) => { onChange(code); setOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}
