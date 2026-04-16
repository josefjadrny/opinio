export interface Strings {
  appName: string;
  trending: string;
  falling: string;
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
  clearFilters: string;
  signIn: string;
  profile: string;
  settings: string;
  about: string;
  logout: string;
  displayName: string;
  country: string;
  detectedFromIp: string;
  anonymousUser: string;
  loginToUnlock: string;
  notLoggedIn: string;
  language: string;
  aboutWhatTitle: string;
  aboutWhatBody: string;
  aboutNoAds: string;
  aboutFreshData: string;
  aboutTiersTitle: string;
  aboutTierAnonymous: string;
  aboutTierRegistered: string;
  aboutTierSupporter: string;
  aboutVotesPerHour: string;
  aboutVoteExpiry: string;
  comingSoon: string;
  roles: Record<string, string>;
}

const en: Strings = {
  appName: 'OPINIO',
  trending: 'Rising',
  falling: 'Falling',
  addProfile: '+ Add Profile',
  login: 'Sign in',
  loginTooltip: 'Sign in with Google',
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
  clearFilters: 'Clear filters',
  signIn: 'Sign in',
  profile: 'Profile',
  settings: 'Settings',
  about: 'About',
  logout: 'Log out',
  displayName: 'Display name',
  country: 'Country',
  detectedFromIp: 'Detected from your IP',
  anonymousUser: 'Anonymous',
  loginToUnlock: 'Log in to change settings',
  notLoggedIn: 'Not logged in',
  language: 'Language',
  aboutWhatTitle: 'A new era of social.',
  aboutWhatBody: 'No useless comments. No spam. Just express your opinion - simply and honestly.',
  aboutNoAds: 'No ads. Ever.',
  aboutFreshData: 'Votes expire after 24 hours - rankings reflect how people feel right now, not last year.',
  aboutTiersTitle: 'Voting limits (per hour)',
  aboutTierAnonymous: 'Anonymous',
  aboutTierRegistered: 'Registered',
  aboutTierSupporter: 'Supporter',
  aboutVotesPerHour: 'votes / hr',
  aboutVoteExpiry: 'Each vote counts once per type (like or dislike) within your hourly allowance.',
  comingSoon: 'coming soon',
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
  appName: 'OPINIO',
  trending: 'Stoupající',
  falling: 'Klesající',
  addProfile: '+ Přidat profil',
  login: 'Přihlásit se',
  loginTooltip: 'Přihlásit se přes Google',
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
  clearFilters: 'Zrušit filtry',
  signIn: 'Přihlásit se',
  profile: 'Profil',
  settings: 'Nastavení',
  about: 'O aplikaci',
  logout: 'Odhlásit',
  displayName: 'Zobrazované jméno',
  country: 'Země',
  detectedFromIp: 'Zjištěno z vaší IP',
  anonymousUser: 'Anonymní',
  loginToUnlock: 'Přihlaste se pro změnu nastavení',
  notLoggedIn: 'Nepřihlášen',
  language: 'Jazyk',
  aboutWhatTitle: 'Nová éra sociálních sítí.',
  aboutWhatBody: 'Žádné zbytečné komentáře. Žádný spam. Jen vyjádři svůj názor - jednoduše a upřímně.',
  aboutNoAds: 'Žádné reklamy. Nikdy.',
  aboutFreshData: 'Hlasy vyprší po 24 hodinách - žebříčky ukazují, jak se lidé cítí teď, ne loni.',
  aboutTiersTitle: 'Limity hlasování (za hodinu)',
  aboutTierAnonymous: 'Anonymní',
  aboutTierRegistered: 'Registrovaný',
  aboutTierSupporter: 'Supporter',
  aboutVotesPerHour: 'hlasů / hod',
  aboutVoteExpiry: 'Každý hlas se počítá jednou za typ (like nebo dislike) v rámci hodinového limitu.',
  comingSoon: 'již brzy',
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
