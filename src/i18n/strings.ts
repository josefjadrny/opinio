export interface Strings {
  appName: string;
  gaining: string;
  losing: string;
  addProfile: string;
  login: string;
  loginTooltip: string;
  allCountries: string;
  allRoles: string;
  noProfiles: string;
  loading: string;
  cancel: string;
  adding: string;
  addProfileTitle: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  imageUrlPlaceholder: string;
  yourNamePlaceholder: string;
  byAuthor: string;
  newBadge: string;
  roles: Record<string, string>;
}

const en: Strings = {
  appName: 'PULSE',
  gaining: 'Gaining',
  losing: 'Losing',
  addProfile: '+ Add Profile',
  login: 'Login',
  loginTooltip: 'Coming soon...',
  allCountries: 'All Countries',
  allRoles: 'All Roles',
  noProfiles: 'No profiles yet',
  loading: 'Loading...',
  cancel: 'Cancel',
  adding: 'Adding...',
  addProfileTitle: 'Add a Profile',
  namePlaceholder: 'Name *',
  descriptionPlaceholder: 'Latest statement or opinion *',
  imageUrlPlaceholder: 'Image URL (optional)',
  yourNamePlaceholder: 'Your name *',
  byAuthor: 'by {author}',
  newBadge: 'NEW',
  roles: {
    politician: 'Politician',
    actor: 'Actor',
    musician: 'Musician',
    athlete: 'Athlete',
    business_leader: 'Business Leader',
    influencer: 'Influencer',
    journalist: 'Journalist',
    activist: 'Activist',
    other: 'Other',
  },
};

const cs: Strings = {
  appName: 'PULSE',
  gaining: 'Stoupající',
  losing: 'Klesající',
  addProfile: '+ Přidat profil',
  login: 'Přihlásit',
  loginTooltip: 'Již brzy...',
  allCountries: 'Všechny země',
  allRoles: 'Všechny role',
  noProfiles: 'Zatím žádné profily',
  loading: 'Načítání...',
  cancel: 'Zrušit',
  adding: 'Přidávání...',
  addProfileTitle: 'Přidat profil',
  namePlaceholder: 'Jméno *',
  descriptionPlaceholder: 'Poslední výrok nebo názor *',
  imageUrlPlaceholder: 'URL obrázku (volitelné)',
  yourNamePlaceholder: 'Vaše jméno *',
  byAuthor: 'přidal {author}',
  newBadge: 'NOVÝ',
  roles: {
    politician: 'Politik',
    actor: 'Herec',
    musician: 'Hudebník',
    athlete: 'Sportovec',
    business_leader: 'Podnikatel',
    influencer: 'Influencer',
    journalist: 'Novinář',
    activist: 'Aktivista',
    other: 'Ostatní',
  },
};

export const LANGUAGES = {
  en: { label: 'English', strings: en },
  cs: { label: 'Čeština', strings: cs },
} as const;

export type Locale = keyof typeof LANGUAGES;

export function getDefaultLocale(): Locale {
  const lang = navigator.language?.split('-')[0];
  if (lang && lang in LANGUAGES) return lang as Locale;
  return 'en';
}
