import { createContext, useContext, useState, useCallback } from 'react';
import { LANGUAGES, getDefaultLocale, type Locale, type Strings } from './strings';

interface I18nContextValue {
  locale: Locale;
  t: Strings;
  setLocale: (locale: Locale) => void;
}

const LOCALE_KEY = 'pulse_locale';

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && stored in LANGUAGES) return stored as Locale;
  } catch { /* ignore */ }
  return getDefaultLocale();
}

const I18nContext = createContext<I18nContextValue>(null!);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
  }, []);

  const t = LANGUAGES[locale].strings;

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
