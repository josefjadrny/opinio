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
  nameLabel: string;
  namePlaceholder: string;
  roleLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  photoLabel: string;
  photoChoose: string;
  photoChange: string;
  photoRemove: string;
  photoHint: string;
  imageUrlPlaceholder: string;
  yourNamePlaceholder: string;
  byAuthor: string;
  newBadge: string;
  clearFilters: string;
  signIn: string;
  nominateTooltip: string;
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
  aboutWhatBodyLead: string;
  aboutWhatBodyEmphasis: string;
  aboutNoAds: string;
  aboutFreshData: string;
  aboutOpenSourceTitle: string;
  aboutOpenSourceBody: string;
  aboutFrontendRepo: string;
  aboutBackendRepo: string;
  aboutEuProject: string;
  aboutMadeInCzechia: string;
  aboutHostedInGermany: string;
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
  addProfile: 'Nominate',
  login: 'Sign in',
  loginTooltip: 'Sign in with Google',
  allCountries: 'All Countries',
  allRoles: 'All Roles',
  noProfiles: 'No profiles yet',
  loading: 'Loading...',
  cancel: 'Cancel',
  adding: 'Adding...',
  addProfileTitle: 'Nominate a Person',
  nameLabel: 'Name',
  namePlaceholder: 'Full name',
  roleLabel: 'Role',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Latest statement or opinion',
  photoLabel: 'Avatar',
  photoChoose: 'Choose avatar',
  photoChange: 'Change avatar',
  photoRemove: 'Remove',
  photoHint: 'Will be cropped to 128×128',
  imageUrlPlaceholder: 'https://...',
  yourNamePlaceholder: 'Your name *',
  byAuthor: 'by {author}',
  newBadge: 'NEW',
  clearFilters: 'Clear filters',
  signIn: 'Sign in',
  nominateTooltip: 'Sign in to nominate',
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
  aboutWhatBodyLead: 'Less noise, more signal. Share your vote -',
  aboutWhatBodyEmphasis: 'simply and honestly.',
  aboutNoAds: 'No ads. No clutter.',
  aboutFreshData: 'If you like Opinio, become a supporter. ❤',
  aboutOpenSourceTitle: 'Free, transparent, and open to everyone.',
  aboutOpenSourceBody: 'Opinio is free and open source. The code is public, anyone can participate, and the ranking rules are transparent.',
  aboutFrontendRepo: 'Frontend repository',
  aboutBackendRepo: 'Backend repository',
  aboutEuProject: 'EU project',
  aboutMadeInCzechia: 'Made in Czechia',
  aboutHostedInGermany: 'Hosted in Germany',
  aboutTiersTitle: 'Voting limits (per hour)',
  aboutTierAnonymous: 'Anonymous',
  aboutTierRegistered: 'Registered',
  aboutTierSupporter: 'Supporter',
  aboutVotesPerHour: 'votes / hr',
  aboutVoteExpiry: 'Votes expire after 24 hours, so rankings reflect how people feel right now. Each vote counts once per type (like or dislike) within your hourly allowance.',
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
  addProfile: 'Nominovat',
  login: 'Přihlásit se',
  loginTooltip: 'Přihlásit se přes Google',
  allCountries: 'Všechny země',
  allRoles: 'Všechny role',
  noProfiles: 'Zatím žádné profily',
  loading: 'Načítání...',
  cancel: 'Zrušit',
  adding: 'Přidávání...',
  addProfileTitle: 'Nominovat osobu',
  nameLabel: 'Jméno',
  namePlaceholder: 'Celé jméno',
  roleLabel: 'Role',
  descriptionLabel: 'Popis',
  descriptionPlaceholder: 'Poslední výrok nebo názor',
  photoLabel: 'Avatar',
  photoChoose: 'Vybrat avatar',
  photoChange: 'Změnit avatar',
  photoRemove: 'Odebrat',
  photoHint: 'Bude oříznut na 128×128',
  imageUrlPlaceholder: 'https://...',
  yourNamePlaceholder: 'Vaše jméno *',
  byAuthor: 'přidal {author}',
  newBadge: 'NOVÝ',
  clearFilters: 'Zrušit filtry',
  signIn: 'Přihlásit se',
  nominateTooltip: 'Přihlaste se pro nominaci',
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
  aboutWhatBodyLead: 'Žádné zbytečné komentáře. Žádný spam. Jen vyjádři svůj názor -',
  aboutWhatBodyEmphasis: 'jednoduše a upřímně.',
  aboutNoAds: 'Žádné reklamy. Žádný balast.',
  aboutFreshData: 'Pokud se ti Opinio líbí, staň se podporovatelem. ❤',
  aboutOpenSourceTitle: 'Zdarma, transparentní a otevřené všem.',
  aboutOpenSourceBody: 'Opinio je zdarma a open source. Kód je veřejný, zapojit se může kdokoli a pravidla řazení jsou transparentní.',
  aboutFrontendRepo: 'Frontend repozitář',
  aboutBackendRepo: 'Backend repozitář',
  aboutEuProject: 'EU projekt',
  aboutMadeInCzechia: 'Vyrobeno v Česku',
  aboutHostedInGermany: 'Hostováno v Německu',
  aboutTiersTitle: 'Limity hlasování (za hodinu)',
  aboutTierAnonymous: 'Anonymní',
  aboutTierRegistered: 'Registrovaný',
  aboutTierSupporter: 'Supporter',
  aboutVotesPerHour: 'hlasů / hod',
  aboutVoteExpiry: 'Hlasy vyprší po 24 hodinách, takže žebříčky ukazují, jak se lidé cítí právě teď. Každý hlas se počítá jednou za typ (like nebo dislike) v rámci hodinového limitu.',
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

const es: Strings = {
  appName: 'OPINIO',
  trending: 'Subiendo',
  falling: 'Bajando',
  addProfile: 'Nominar',
  login: 'Iniciar sesión',
  loginTooltip: 'Iniciar sesión con Google',
  allCountries: 'Todos los países',
  allRoles: 'Todos los roles',
  noProfiles: 'Aún no hay perfiles',
  loading: 'Cargando...',
  cancel: 'Cancelar',
  adding: 'Añadiendo...',
  addProfileTitle: 'Nominar una persona',
  nameLabel: 'Nombre',
  namePlaceholder: 'Nombre completo',
  roleLabel: 'Rol',
  descriptionLabel: 'Descripción',
  descriptionPlaceholder: 'Última declaración u opinión',
  photoLabel: 'Avatar',
  photoChoose: 'Elegir avatar',
  photoChange: 'Cambiar avatar',
  photoRemove: 'Eliminar',
  photoHint: 'Se recortará a 128×128',
  imageUrlPlaceholder: 'https://...',
  yourNamePlaceholder: 'Tu nombre *',
  byAuthor: 'por {author}',
  newBadge: 'NUEVO',
  clearFilters: 'Borrar filtros',
  signIn: 'Iniciar sesión',
  nominateTooltip: 'Inicia sesión para nominar',
  profile: 'Perfil',
  settings: 'Ajustes',
  about: 'Acerca de',
  logout: 'Cerrar sesión',
  displayName: 'Nombre visible',
  country: 'País',
  detectedFromIp: 'Detectado desde tu IP',
  anonymousUser: 'Anónimo',
  loginToUnlock: 'Inicia sesión para cambiar ajustes',
  notLoggedIn: 'No has iniciado sesión',
  language: 'Idioma',
  aboutWhatTitle: 'Una nueva era de lo social.',
  aboutWhatBodyLead: 'Sin comentarios inútiles. Sin spam. Solo expresa tu opinión —',
  aboutWhatBodyEmphasis: 'de forma simple y honesta.',
  aboutNoAds: 'Sin anuncios. Sin ruido.',
  aboutFreshData: 'Si te gusta Opinio, hazte supporter. ❤',
  aboutOpenSourceTitle: 'Gratis, transparente y abierto para todos.',
  aboutOpenSourceBody: 'Opinio es gratis y de código abierto. El código es público, cualquiera puede participar y las reglas de clasificación son transparentes.',
  aboutFrontendRepo: 'Repositorio del frontend',
  aboutBackendRepo: 'Repositorio del backend',
  aboutEuProject: 'Proyecto de la UE',
  aboutMadeInCzechia: 'Hecho en Chequia',
  aboutHostedInGermany: 'Alojado en Alemania',
  aboutTiersTitle: 'Límites de votación (por hora)',
  aboutTierAnonymous: 'Anónimo',
  aboutTierRegistered: 'Registrado',
  aboutTierSupporter: 'Supporter',
  aboutVotesPerHour: 'votos / h',
  aboutVoteExpiry: 'Los votos caducan a las 24 horas, así que los rankings reflejan cómo se siente la gente ahora. Cada voto cuenta una vez por tipo (like o dislike) dentro de tu límite por hora.',
  comingSoon: 'próximamente',
  roles: {
    politician: 'Político',
    actor: 'Actor',
    musician: 'Músico',
    athlete: 'Deportista',
    business_leader: 'Empresario',
    influencer: 'Influencer',
    journalist: 'Periodista',
    activist: 'Activista',
    other: 'Otro',
  },
};

export const LANGUAGES = {
  en: { label: '🇬🇧 English', strings: en },
  cs: { label: '🇨🇿 Čeština', strings: cs },
  es: { label: '🇪🇸 Español', strings: es },
} as const;

export type Locale = keyof typeof LANGUAGES;

export function getDefaultLocale(): Locale {
  const lang = navigator.language?.split('-')[0];
  if (lang && lang in LANGUAGES) return lang as Locale;
  return 'en';
}
