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
  aboutWhatBodyEmphasisPart1: string;
  aboutWhatBodyEmphasisConnector: string;
  aboutWhatBodyEmphasisPart2: string;
  aboutNoAds: string;
  aboutFreshData: string;
  aboutOpenSourceTitle: string;
  aboutOpenSourceTitleEmphasis: string;
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
  stats: string;
  statsTitle: string;
  statsTopLikers: string;
  statsTopDislikers: string;
  statsVotes: string;
  statsNoData: string;
  statsOverview: string;
  support: string;
  supportTitle: string;
  supportNewTicket: string;
  supportNoTickets: string;
  supportOverview: string;
  supportSignIn: string;
  supportTitleLabel: string;
  supportTitlePlaceholder: string;
  supportCategoryLabel: string;
  supportDescriptionLabel: string;
  supportDescriptionPlaceholder: string;
  supportSubmit: string;
  supportSubmitting: string;
  supportBack: string;
  supportClose: string;
  supportAdminReply: string;
  supportAdminNote: string;
  supportSave: string;
  supportStatusLabel: string;
  supportCategories: Record<string, string>;
  supportStatuses: Record<string, string>;
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
  aboutWhatTitle: 'Less noise, more real opinions.',
  aboutWhatBodyLead: 'No endless comment wars, no spam. Share your opinion -',
  aboutWhatBodyEmphasisPart1: 'simply',
  aboutWhatBodyEmphasisConnector: 'and',
  aboutWhatBodyEmphasisPart2: 'honestly.',
  aboutNoAds: 'No ads. No clutter.',
  aboutFreshData: 'Anyway, we have kids 👶 and bills to pay 💳. If you like Opinio, become a supporter. ❤',
  aboutOpenSourceTitle: 'Opinio is',
  aboutOpenSourceTitleEmphasis: 'free and open source.',
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
  aboutVoteExpiry: 'Votes expire after 24 hours, so rankings reflect how people feel right now. You gain new votes every hour. Each vote counts once per type (▲ or ▼) within your hourly allowance.',
  comingSoon: 'coming soon',
  stats: 'Stats',
  statsTitle: 'Community Stats',
  statsTopLikers: 'Top Likers',
  statsTopDislikers: 'Top Dislikers',
  statsVotes: 'votes',
  statsNoData: 'No data yet',
  statsOverview: 'See who has been voting the most. Top 10 likers and dislikers from the community, updated every minute.',
  support: 'Support',
  supportTitle: 'Support',
  supportNewTicket: 'New ticket',
  supportNoTickets: 'No tickets yet',
  supportOverview: 'Have a question, found a bug, or want to request a feature? Open a ticket and we\'ll get back to you.',
  supportSignIn: 'Sign in to access support',
  supportTitleLabel: 'Subject',
  supportTitlePlaceholder: 'Short description of the issue',
  supportCategoryLabel: 'Category',
  supportDescriptionLabel: 'Details',
  supportDescriptionPlaceholder: 'Please describe the issue in detail…',
  supportSubmit: 'Submit ticket',
  supportSubmitting: 'Submitting…',
  supportBack: 'Back',
  supportClose: 'Close ticket',
  supportAdminReply: 'Reply to user',
  supportAdminNote: 'Internal note',
  supportSave: 'Save',
  supportStatusLabel: 'Status',
  supportCategories: {
    bug: 'Bug',
    feature: 'Feature request',
    subscription: 'Subscription',
    other: 'Other',
  },
  supportStatuses: {
    new: 'New',
    investigating: 'Investigating',
    waiting: 'Waiting',
    done: 'Done',
  },
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
  aboutWhatTitle: 'Méně balastu, více skutečných názorů.',
  aboutWhatBodyLead: 'Bez dohadu a bez spamu. Řekni, co si myslíš -',
  aboutWhatBodyEmphasisPart1: 'jednoduše',
  aboutWhatBodyEmphasisConnector: 'a',
  aboutWhatBodyEmphasisPart2: 'upřímně.',
  aboutNoAds: 'Žádné reklamy. Žádný balast.',
  aboutFreshData: 'Máme děti 👶 a platíme účty 💳. Pokud se ti Opinio líbí, staň se podporovatelem. ❤',
  aboutOpenSourceTitle: 'Opinio je',
  aboutOpenSourceTitleEmphasis: 'zdarma a open source.',
  aboutOpenSourceBody: 'Opinio je zdarma a open source. Kód je veřejný, zapojit se může kdokoli a pravidla zobrazení jsou transparentní.',
  aboutFrontendRepo: 'Frontend repo',
  aboutBackendRepo: 'Backend repo',
  aboutEuProject: 'EU projekt',
  aboutMadeInCzechia: 'Vyrobeno v Česku',
  aboutHostedInGermany: 'Hostováno v Německu',
  aboutTiersTitle: 'Limity hlasování (za hodinu)',
  aboutTierAnonymous: 'Anonymní',
  aboutTierRegistered: 'Registrovaný',
  aboutTierSupporter: 'Supporter',
  aboutVotesPerHour: 'hlasů / hod',
  aboutVoteExpiry: 'Hlasy vyprší po 24 hodinách, takže žebříčky ukazují, jak se lidé cítí právě teď. Nové hlasy získáváš každou hodinu. Každý hlas se počítá jednou za typ (▲ nebo ▼) v rámci hodinového limitu.',
  comingSoon: 'již brzy',
  stats: 'Statistiky',
  statsTitle: 'Komunitní statistiky',
  statsTopLikers: 'Top hlasující (kladně)',
  statsTopDislikers: 'Top hlasující (záporně)',
  statsVotes: 'hlasů',
  statsNoData: 'Zatím žádná data',
  statsOverview: 'Zjistěte, kdo hlasuje nejvíce. Top 10 pozitivních a negativních hlasujících z komunity, aktualizováno každou minutu.',
  support: 'Podpora',
  supportTitle: 'Podpora',
  supportNewTicket: 'Nový požadavek',
  supportNoTickets: 'Zatím žádné požadavky',
  supportOverview: 'Máte otázku, našli jste chybu nebo chcete navrhnout funkci? Otevřete požadavek a ozveme se vám.',
  supportSignIn: 'Přihlaste se pro přístup k podpoře',
  supportTitleLabel: 'Předmět',
  supportTitlePlaceholder: 'Krátký popis problému',
  supportCategoryLabel: 'Kategorie',
  supportDescriptionLabel: 'Podrobnosti',
  supportDescriptionPlaceholder: 'Popište problém podrobně…',
  supportSubmit: 'Odeslat požadavek',
  supportSubmitting: 'Odesílání…',
  supportBack: 'Zpět',
  supportClose: 'Uzavřít požadavek',
  supportAdminReply: 'Odpověď uživateli',
  supportAdminNote: 'Interní poznámka',
  supportSave: 'Uložit',
  supportStatusLabel: 'Stav',
  supportCategories: {
    bug: 'Chyba',
    feature: 'Nová funkce',
    subscription: 'Předplatné',
    other: 'Ostatní',
  },
  supportStatuses: {
    new: 'Nový',
    investigating: 'Prošetřujeme',
    waiting: 'Čeká',
    done: 'Vyřešeno',
  },
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
  aboutWhatTitle: 'Menos ruido, más opiniones reales.',
  aboutWhatBodyLead: 'Sin peleas eternas ni spam. Di lo que piensas —',
  aboutWhatBodyEmphasisPart1: 'de forma simple',
  aboutWhatBodyEmphasisConnector: 'y',
  aboutWhatBodyEmphasisPart2: 'honesta.',
  aboutNoAds: 'Sin anuncios. Sin ruido.',
  aboutFreshData: 'Bueno, tenemos hijos 👶 y facturas que pagar 💳. Si te gusta Opinio, hazte supporter. ❤',
  aboutOpenSourceTitle: 'Opinio es',
  aboutOpenSourceTitleEmphasis: 'gratis y de código abierto.',
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
  aboutVoteExpiry: 'Los votos caducan a las 24 horas, así que los rankings reflejan cómo se siente la gente ahora. Ganas nuevos votos cada hora. Cada voto cuenta una vez por tipo (▲ o ▼) dentro de tu límite por hora.',
  comingSoon: 'próximamente',
  stats: 'Estadísticas',
  statsTitle: 'Estadísticas de la comunidad',
  statsTopLikers: 'Top votantes positivos',
  statsTopDislikers: 'Top votantes negativos',
  statsVotes: 'votos',
  statsNoData: 'Sin datos aún',
  statsOverview: 'Descubre quién ha votado más. Los 10 principales votantes positivos y negativos de la comunidad, actualizado cada minuto.',
  support: 'Soporte',
  supportTitle: 'Soporte',
  supportNewTicket: 'Nuevo ticket',
  supportNoTickets: 'Sin tickets todavía',
  supportOverview: '¿Tienes una pregunta, encontraste un error o quieres sugerir una función? Abre un ticket y te responderemos.',
  supportSignIn: 'Inicia sesión para acceder al soporte',
  supportTitleLabel: 'Asunto',
  supportTitlePlaceholder: 'Breve descripción del problema',
  supportCategoryLabel: 'Categoría',
  supportDescriptionLabel: 'Detalles',
  supportDescriptionPlaceholder: 'Describe el problema en detalle…',
  supportSubmit: 'Enviar ticket',
  supportSubmitting: 'Enviando…',
  supportBack: 'Volver',
  supportClose: 'Cerrar ticket',
  supportAdminReply: 'Respuesta al usuario',
  supportAdminNote: 'Nota interna',
  supportSave: 'Guardar',
  supportStatusLabel: 'Estado',
  supportCategories: {
    bug: 'Error',
    feature: 'Nueva función',
    subscription: 'Suscripción',
    other: 'Otro',
  },
  supportStatuses: {
    new: 'Nuevo',
    investigating: 'Investigando',
    waiting: 'En espera',
    done: 'Resuelto',
  },
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
