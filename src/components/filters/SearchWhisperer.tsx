import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { useFilters } from '../../context/useFilters';
import { useCountries } from '../../hooks/useCountries';
import { useSearchSuggest, SUGGEST_MIN_CHARS } from '../../hooks/useSearchSuggest';
import { getCountriesList, getCountryName, getCountryFlag } from '../../utils/countries';
import { RoleBadge } from '../common/RoleBadge';
import type { Profile } from '../../types/profile';
import type { SuggestUser } from '../../types/api';

// Leading icons that give each result group a distinct identity at a glance:
// a globe for countries (a place / filter), a person for users, a speech
// bubble for opinios. Rendered next to the group label.
const GroupIcon = {
  country: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  ),
  user: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
    </svg>
  ),
  opinio: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 8h8m-8 8h5M4 4h16v12H8l-4 4V4z" />
    </svg>
  ),
};

const DEBOUNCE_MS = 250;
const COUNTRY_LIMIT = 3;
const ANON_AVATAR = '/icons/anonymous-mask.png';

interface CountryMatch { code: string; name: string; votes: number; }

// Flat, keyboard-navigable list of everything shown in the dropdown. The final
// 'search' entry is always present so Enter (or clicking it) runs the full-text
// opinio search regardless of what else matched.
type Item =
  | { kind: 'country'; country: CountryMatch }
  | { kind: 'user'; user: SuggestUser }
  | { kind: 'profile'; profile: Profile }
  | { kind: 'search' };

interface Props {
  variant: 'desktop' | 'mobile';
  // Called after any suggestion/action is chosen. The mobile sheet passes its
  // close handler so picking a result dismisses the sheet and reveals results.
  onSelect?: () => void;
}

/**
 * Search box with a typeahead ("whisperer") dropdown. Suggestions are grouped
 * countries (max 3, by votes) -> users (max 3) -> opinios (max 10), then a
 * final "search all opinios" action. Picking a country sets the country filter;
 * a user opens /u/:id; an opinio opens /p/:id; the action applies ?q= (the
 * classic full-text feed search). Typing no longer auto-runs the feed search -
 * it only feeds the whisperer until the user picks something or presses Enter.
 */
export function SearchWhisperer({ variant, onSelect }: Props) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { search, setSearch, selectCountry } = useFilters();

  const [text, setText] = useState(search);
  const [debounced, setDebounced] = useState(search);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Adopt external ?q= changes (clear-filters, back/forward). The only writes to
  // `search` are our own explicit actions, so this never clobbers live typing.
  useEffect(() => { setText(search); }, [search]);

  // Debounce what the whisperer queries on (both the API suggest + local country
  // match key off `debounced`), while the input stays instantly responsive.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [text]);

  const query = debounced.trim();
  const active = query.length >= SUGGEST_MIN_CHARS;

  const { data: suggest } = useSearchSuggest(debounced, locale);
  const { data: countriesData } = useCountries();

  // Total (active 24h) votes per country, for ranking country matches.
  const votesByCode = useMemo(() => {
    const m = new Map<string, number>();
    countriesData?.countries.forEach((c) => m.set(c.code, c.likes + c.dislikes));
    return m;
  }, [countriesData]);

  // Match country by localized OR English name (so English input works in any
  // locale), rank by votes desc, take the top few.
  const countryMatches = useMemo<CountryMatch[]>(() => {
    if (!active) return [];
    const q = query.toLowerCase();
    return getCountriesList(locale)
      .filter((c) => c.name.toLowerCase().includes(q) || getCountryName(c.code, 'en').toLowerCase().includes(q))
      .map((c) => ({ code: c.code, name: c.name, votes: votesByCode.get(c.code) ?? 0 }))
      .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, locale))
      .slice(0, COUNTRY_LIMIT);
  }, [active, query, locale, votesByCode]);

  const users = suggest?.users ?? [];
  const profiles = suggest?.profiles ?? [];

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [
      ...countryMatches.map((country) => ({ kind: 'country', country } as Item)),
      ...users.map((user) => ({ kind: 'user', user } as Item)),
      ...profiles.map((profile) => ({ kind: 'profile', profile } as Item)),
      { kind: 'search' },
    ];
    return list;
  }, [countryMatches, users, profiles]);

  const showDropdown = open && active;

  // Reset highlight whenever the visible items change so it never points past
  // the end of a shrunken list.
  useEffect(() => { setHighlight(-1); }, [items.length]);

  const close = useCallback(() => { setOpen(false); setHighlight(-1); }, []);

  const runFullSearch = useCallback(() => {
    setSearch(text);
    close();
    inputRef.current?.blur();
    onSelect?.();
  }, [text, setSearch, close, onSelect]);

  const selectItem = useCallback((item: Item) => {
    switch (item.kind) {
      case 'country':
        selectCountry(item.country.code);
        setText('');
        break;
      case 'user':
        navigate(`/u/${item.user.id}${location.search}`);
        break;
      case 'profile':
        navigate(`/p/${item.profile.id}${location.search}`);
        break;
      case 'search':
        runFullSearch();
        return;
    }
    close();
    onSelect?.();
  }, [selectCountry, navigate, location.search, runFullSearch, close, onSelect]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && highlight >= 0 && highlight < items.length) selectItem(items[highlight]);
      else runFullSearch();
      return;
    }
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
  };

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const clear = () => {
    setText('');
    setSearch('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const inputClass = variant === 'desktop'
    ? 'bg-surface-light text-text-primary text-sm rounded-lg border border-border pl-8 pr-7 py-1.5 w-44 focus:outline-none focus:border-accent placeholder:text-text-primary/40'
    : 'w-full bg-surface-light text-text-primary text-sm rounded-lg border border-border pl-8 pr-7 py-2 focus:outline-none focus:border-accent placeholder:text-text-primary/40';

  // Running index across the flat item list, so highlight/selection line up.
  let idx = -1;
  const rowProps = (i: number) => ({
    onMouseEnter: () => setHighlight(i),
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); selectItem(items[i]); },
    className: `flex items-center gap-2 px-3 py-1.5 cursor-pointer ${highlight === i ? 'bg-surface-light' : ''}`,
  });

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          autoComplete="off"
          className={inputClass}
        />
        {text && (
          <button
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className={`${variant === 'desktop' ? 'absolute left-0 mt-1 w-72 z-50' : 'mt-2 w-full'} bg-surface border border-border rounded-lg shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto`}
        >
          {countryMatches.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/50 px-3 pt-2 pb-1">
                {GroupIcon.country}{t.statsBoardCountries}
              </p>
              {countryMatches.map((country) => {
                idx++;
                const i = idx;
                return (
                  <div key={`c-${country.code}`} {...rowProps(i)}>
                    <span className="w-6 h-6 rounded shrink-0 flex items-center justify-center text-base leading-none bg-surface-light">{getCountryFlag(country.code)}</span>
                    <span className="text-sm text-text-primary truncate">{country.name}</span>
                    {/* funnel — signals this row filters the feed rather than opening a page */}
                    <svg className="ml-auto w-3.5 h-3.5 text-white/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}

          {users.length > 0 && (
            <div className={countryMatches.length > 0 ? 'border-t border-border/60' : ''}>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/50 px-3 pt-2 pb-1">
                {GroupIcon.user}{t.statsBoardUsers}
              </p>
              {users.map((user) => {
                idx++;
                const i = idx;
                return (
                  <div key={`u-${user.id}`} {...rowProps(i)}>
                    <img
                      src={user.avatarUrl || ANON_AVATAR}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover shrink-0 bg-surface-light ring-1 ring-white/10"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = ANON_AVATAR; }}
                    />
                    {/* @-prefix instantly reads as a person / account */}
                    <span className="text-sm text-text-primary truncate">
                      <span className="text-white/50">@</span>{user.displayName}
                    </span>
                    {user.countryCode && <span className="ml-auto text-xs leading-none shrink-0">{getCountryFlag(user.countryCode)}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {profiles.length > 0 && (
            <div className={countryMatches.length > 0 || users.length > 0 ? 'border-t border-border/60' : ''}>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/50 px-3 pt-2 pb-1">
                {GroupIcon.opinio}{t.statsBoardOpinios}
              </p>
              {profiles.map((profile) => {
                idx++;
                const i = idx;
                return (
                  <div key={`p-${profile.id}`} {...rowProps(i)}>
                    {profile.imageUrl
                      ? <img src={profile.imageUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                      : <span className="w-6 h-6 rounded bg-surface-light shrink-0 flex items-center justify-center text-xs">{getCountryFlag(profile.countryCode)}</span>}
                    <span className="text-sm text-text-primary truncate">{profile.name}</span>
                    {/* colored category pill — a signal unique to opinios */}
                    <RoleBadge role={profile.role} className="ml-auto shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {(() => {
            idx++;
            const i = idx;
            return (
              <div className="border-t border-border">
                <div key="search" {...rowProps(i)}>
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <span className="text-sm text-text-primary truncate">
                    {t.searchAllOpinios} <span className="text-white/50">&ldquo;{text.trim()}&rdquo;</span>
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
