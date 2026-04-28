export interface Strings {
  appName: string;
  trending: string;
  falling: string;
  addProfile: string;
  login: string;
  loginTooltip: string;
  allCountries: string;
  allCategories: string;
  noProfiles: string;
  loading: string;
  cancel: string;
  adding: string;
  addProfileTitle: string;
  dropButton: string;
  statementLabel: string;
  statementPlaceholder: string;
  categoryLabel: string;
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
  profileCountry: string;
  detectedFromIp: string;
  anonymousUser: string;
  loginToUnlock: string;
  notLoggedIn: string;
  language: string;
  aboutHero: string;
  aboutFreshness: string;
  aboutPrinciplesTitle: string;
  aboutPrincipleNoAds: string;
  aboutPrincipleNoSharing: string;
  aboutPrincipleNoTweaks: string;
  aboutPrincipleDataDeletion: string;
  aboutFrontendRepo: string;
  aboutBackendRepo: string;
  aboutSourceLink: string;
  aboutEuProject: string;
  aboutMadeInCzechia: string;
  aboutHostedInGermany: string;
  aboutTiersTitle: string;
  aboutTierAnonymous: string;
  aboutTierRegistered: string;
  aboutTierSupporter: string;
  aboutSupporterPriceNote: string;
  aboutVotesPerHour: string;
  aboutVoteExpiry: string;
  privacy: string;
  privacyLastUpdated: string;
  privacyOperatorTitle: string;
  privacyOperatorBody: string;
  privacyDataTitle: string;
  privacyDataBody: string;
  privacyWhyTitle: string;
  privacyWhyBody: string;
  privacyCookiesTitle: string;
  privacyCookiesBody: string;
  privacyThirdPartiesTitle: string;
  privacyThirdPartiesBody: string;
  privacyRetentionTitle: string;
  privacyRetentionVotes: string;
  privacyRetentionProfiles: string;
  privacyRetentionAccounts: string;
  privacyRightsTitle: string;
  privacyRightsBody: string;
  privacyOpenSupport: string;
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
  displayNameFormat: string;
  displayNameTaken: string;
  noCountryWarning: string;
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
  votesLeft: string;
  nextVote: string;
  agree: string;
  disagree: string;
}

const en: Strings = {
  appName: 'OPINIO',
  trending: 'Rising',
  falling: 'Falling',
  addProfile: 'Opinion',
  login: 'Sign in',
  loginTooltip: 'Sign in with Google',
  allCountries: 'All Countries',
  allCategories: 'All Categories',
  noProfiles: 'No profiles yet',
  loading: 'Loading...',
  cancel: 'Cancel',
  adding: 'Adding...',
  addProfileTitle: 'Drop an opinion',
  dropButton: 'Drop',
  statementLabel: 'Statement',
  statementPlaceholder: 'Headline, name, or event…',
  categoryLabel: 'Category',
  descriptionLabel: 'Long story short',
  descriptionPlaceholder: 'Give it some context…',
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
  nominateTooltip: 'Sign in to drop an opinion',
  profile: 'Profile',
  settings: 'Settings',
  about: 'About',
  logout: 'Log out',
  displayName: 'Display name',
  country: 'Country',
  profileCountry: 'Country of origin',
  detectedFromIp: 'Detected from your IP',
  anonymousUser: 'Anonymous',
  loginToUnlock: 'Log in to change settings',
  notLoggedIn: 'Not logged in',
  language: 'Language',
  aboutHero: 'Vote on the stories shaping the world today.',
  aboutFreshness: 'Every vote expires after 24 hours. You see current sentiment, not history.',
  aboutPrinciplesTitle: 'Our principles',
  aboutPrincipleNoAds: 'No ads. No trackers.',
  aboutPrincipleNoSharing: "We don't share your data with third parties.",
  aboutPrincipleNoTweaks: "We don't tweak the rankings.",
  aboutPrincipleDataDeletion: 'Delete your data via support. Inactive accounts are auto-removed after 6 months.',
  aboutFrontendRepo: 'Frontend repository',
  aboutBackendRepo: 'Backend repository',
  aboutSourceLink: 'Source',
  aboutEuProject: 'Made in EU',
  aboutMadeInCzechia: 'Czechia',
  aboutHostedInGermany: 'Servers in Germany',
  aboutTiersTitle: 'Voting limits (per hour)',
  aboutTierAnonymous: 'Anonymous',
  aboutTierRegistered: 'Registered',
  aboutTierSupporter: 'Supporter',
  aboutSupporterPriceNote: '€2.99 / month',
  aboutVotesPerHour: 'votes / hr',
  aboutVoteExpiry: 'Votes expire after 24 hours, so rankings reflect how people feel right now. You gain new votes every hour. Each vote counts once per type (▲ or ▼) within your hourly allowance.',
  privacy: 'Privacy',
  privacyLastUpdated: 'Last updated: April 29, 2026',
  privacyOperatorTitle: 'Operator',
  privacyOperatorBody: 'Operator and data controller: Josef Jadrný, Czechia. Contact: bc.josefjadrny@gmail.com.',
  privacyDataTitle: 'What we collect',
  privacyDataBody: 'When you sign in: provider id, email, display name, avatar URL. When you vote: IP address, country code (from your IP), and your user id. Your preferences: chosen interface language and country override.',
  privacyWhyTitle: 'Why we collect it',
  privacyWhyBody: 'We collect this data only for the platform to function: to identify your account, prevent duplicate sign-ins, limit how many votes a single person or IP can cast per hour, show country breakdowns, and default your country and language correctly.',
  privacyCookiesTitle: 'Cookies',
  privacyCookiesBody: 'We set a single signed cookie that keeps you signed in. We do not use any analytics, advertising, or tracking cookies.',
  privacyThirdPartiesTitle: 'Third parties',
  privacyThirdPartiesBody: 'We do not sell, rent, or share your data. Servers run on Amazon Web Services in Frankfurt, Germany. Sign-in is handled by Google as identity provider — Google\'s privacy policy applies for that step. Cloudflare proxies traffic and detects your country from your IP.',
  privacyRetentionTitle: 'Retention',
  privacyRetentionVotes: 'Votes are deleted after 24 hours.',
  privacyRetentionProfiles: 'Profiles with no votes after 3 days are deleted automatically.',
  privacyRetentionAccounts: 'User accounts inactive for 6 months are deleted automatically.',
  privacyRightsTitle: 'Your rights',
  privacyRightsBody: 'Under GDPR you have the right to access, correct, or delete your data, or to object to processing. Contact us through support or by email at bc.josefjadrny@gmail.com. We respond within 30 days.',
  privacyOpenSupport: 'Open support',
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
  displayNameFormat: 'Only lowercase letters, numbers, and underscores (3–30 characters)',
  displayNameTaken: 'This handle is already taken',
  noCountryWarning: "We couldn't detect your country. Voting is disabled.",
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
    account: 'Account',
    other: 'Other',
  },
  supportStatuses: {
    new: 'New',
    investigating: 'Investigating',
    waiting: 'Waiting',
    done: 'Done',
  },
  roles: {
    politics: 'Politics',
    culture: 'Culture',
    sports: 'Sports',
    business: 'Business',
    media: 'Media',
    health: 'Health',
    tech: 'Tech',
  },
  votesLeft: 'votes left',
  nextVote: 'next vote',
  agree: 'Like',
  disagree: 'Dislike',
};

const cs: Strings = {
  appName: 'OPINIO',
  trending: 'Stoupající',
  falling: 'Klesající',
  addProfile: 'Názor',
  login: 'Přihlásit se',
  loginTooltip: 'Přihlásit se přes Google',
  allCountries: 'Všechny země',
  allCategories: 'Všechny kategorie',
  noProfiles: 'Zatím žádné profily',
  loading: 'Načítání...',
  cancel: 'Zrušit',
  adding: 'Přidávání...',
  addProfileTitle: 'Přidat názor',
  dropButton: 'Přidat',
  statementLabel: 'Prohlášení',
  statementPlaceholder: 'Titulek, jméno nebo událost…',
  categoryLabel: 'Kategorie',
  descriptionLabel: 'Zkrátka řečeno',
  descriptionPlaceholder: 'Přidejte kontext…',
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
  nominateTooltip: 'Přihlaste se pro přidání názoru',
  profile: 'Profil',
  settings: 'Nastavení',
  about: 'O aplikaci',
  logout: 'Odhlásit',
  displayName: 'Zobrazované jméno',
  country: 'Země',
  profileCountry: 'Země původu',
  detectedFromIp: 'Zjištěno z vaší IP',
  anonymousUser: 'Anonymní',
  loginToUnlock: 'Přihlaste se pro změnu nastavení',
  notLoggedIn: 'Nepřihlášen',
  language: 'Jazyk',
  aboutHero: 'Hlasujte o názorech, které utvářejí dnešní svět.',
  aboutFreshness: 'Každý hlas vyprší po 24 hodinách. Vidíte aktuální náladu, ne historii.',
  aboutPrinciplesTitle: 'Naše principy',
  aboutPrincipleNoAds: 'Žádné reklamy. Žádné sledovače.',
  aboutPrincipleNoSharing: 'Vaše data nepředáváme třetím stranám.',
  aboutPrincipleNoTweaks: 'Pořadí nijak neupravujeme.',
  aboutPrincipleDataDeletion: 'Smazání dat přes podporu. Neaktivní účty mažeme po 6 měsících.',
  aboutFrontendRepo: 'Frontend repo',
  aboutBackendRepo: 'Backend repo',
  aboutSourceLink: 'Zdrojový kód',
  aboutEuProject: 'Vytvořeno v EU',
  aboutMadeInCzechia: 'Česko',
  aboutHostedInGermany: 'Servery v Německu',
  aboutTiersTitle: 'Limity hlasování (za hodinu)',
  aboutTierAnonymous: 'Anonymní',
  aboutTierRegistered: 'Registrovaný',
  aboutTierSupporter: 'Podporovatel',
  aboutSupporterPriceNote: '2,99 € / měsíc',
  aboutVotesPerHour: 'hlasů / hod',
  aboutVoteExpiry: 'Hlasy vyprší po 24 hodinách, takže žebříčky ukazují, jak se lidé cítí právě teď. Nové hlasy získáváš každou hodinu. Každý hlas se počítá jednou za typ (▲ nebo ▼) v rámci hodinového limitu.',
  privacy: 'Ochrana osobních údajů',
  privacyLastUpdated: 'Aktualizováno: 29. dubna 2026',
  privacyOperatorTitle: 'Provozovatel',
  privacyOperatorBody: 'Provozovatel a správce údajů: Josef Jadrný, Česko. Kontakt: bc.josefjadrny@gmail.com.',
  privacyDataTitle: 'Co sbíráme',
  privacyDataBody: 'Při přihlášení: ID poskytovatele, e-mail, zobrazované jméno, URL avataru. Při hlasování: IP adresa, kód země (z vaší IP) a vaše ID uživatele. Vaše předvolby: zvolený jazyk rozhraní a případně přepsaná země.',
  privacyWhyTitle: 'Proč to sbíráme',
  privacyWhyBody: 'Tato data sbíráme jen aby platforma fungovala: pro identifikaci vašeho účtu, prevenci duplicitních přihlášení, omezení počtu hlasů jednoho uživatele nebo IP za hodinu, zobrazení rozpadu podle zemí a správné nastavení vaší země a jazyka.',
  privacyCookiesTitle: 'Soubory cookie',
  privacyCookiesBody: 'Nastavujeme jednu podepsanou cookie pro přihlášení. Žádné analytické, reklamní ani sledovací cookies.',
  privacyThirdPartiesTitle: 'Třetí strany',
  privacyThirdPartiesBody: 'Vaše data neprodáváme, nepronajímáme ani je nesdílíme. Servery běží na Amazon Web Services ve Frankfurtu, Německo. Přihlášení zajišťuje Google jako poskytovatel identity — pro tento krok platí jeho zásady ochrany. Cloudflare proxuje provoz a detekuje zemi z vaší IP.',
  privacyRetentionTitle: 'Doba uchování',
  privacyRetentionVotes: 'Hlasy mažeme po 24 hodinách.',
  privacyRetentionProfiles: 'Profily bez hlasů po 3 dnech mažeme automaticky.',
  privacyRetentionAccounts: 'Neaktivní uživatelské účty po 6 měsících mažeme automaticky.',
  privacyRightsTitle: 'Vaše práva',
  privacyRightsBody: 'Podle GDPR máte právo na přístup ke svým údajům, jejich opravu nebo smazání, případně proti jejich zpracování vznést námitku. Pište přes podporu nebo e-mailem na bc.josefjadrny@gmail.com. Odpovídáme do 30 dnů.',
  privacyOpenSupport: 'Otevřít podporu',
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
  displayNameFormat: 'Pouze malá písmena, číslice a podtržítka (3–30 znaků)',
  displayNameTaken: 'Toto jméno je již obsazeno',
  noCountryWarning: 'Nepodařilo se nám zjistit vaši zemi. Hlasování je zakázáno.',
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
    account: 'Účet',
    other: 'Ostatní',
  },
  supportStatuses: {
    new: 'Nový',
    investigating: 'Prošetřujeme',
    waiting: 'Čeká',
    done: 'Vyřešeno',
  },
  roles: {
    politics: 'Politika',
    culture: 'Kultura',
    sports: 'Sport',
    business: 'Byznys',
    media: 'Média',
    health: 'Zdravotnictví',
    tech: 'Technologie',
  },
  votesLeft: 'zbývá hlasů',
  nextVote: 'příští hlas',
  agree: 'Líbí',
  disagree: 'Nelíbí',
};

const es: Strings = {
  appName: 'OPINIO',
  trending: 'Subiendo',
  falling: 'Bajando',
  addProfile: 'Opinión',
  login: 'Iniciar sesión',
  loginTooltip: 'Iniciar sesión con Google',
  allCountries: 'Todos los países',
  allCategories: 'Todas las categorías',
  noProfiles: 'Aún no hay perfiles',
  loading: 'Cargando...',
  cancel: 'Cancelar',
  adding: 'Añadiendo...',
  addProfileTitle: 'Dar una opinión',
  dropButton: 'Soltar',
  statementLabel: 'Declaración',
  statementPlaceholder: 'Titular, nombre o evento…',
  categoryLabel: 'Categoría',
  descriptionLabel: 'En pocas palabras',
  descriptionPlaceholder: 'Añade algo de contexto…',
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
  nominateTooltip: 'Inicia sesión para dar una opinión',
  profile: 'Perfil',
  settings: 'Ajustes',
  about: 'Acerca de',
  logout: 'Cerrar sesión',
  displayName: 'Nombre visible',
  country: 'País',
  profileCountry: 'País de origen',
  detectedFromIp: 'Detectado desde tu IP',
  anonymousUser: 'Anónimo',
  loginToUnlock: 'Inicia sesión para cambiar ajustes',
  notLoggedIn: 'No has iniciado sesión',
  language: 'Idioma',
  aboutHero: 'Vote on the stories shaping the world today.',
  aboutFreshness: 'Every vote expires after 24 hours. You see current sentiment, not history.',
  aboutPrinciplesTitle: 'Our principles',
  aboutPrincipleNoAds: 'No ads. No trackers.',
  aboutPrincipleNoSharing: "We don't share your data with third parties.",
  aboutPrincipleNoTweaks: "We don't tweak the rankings.",
  aboutPrincipleDataDeletion: 'Delete your data via support. Inactive accounts are auto-removed after 6 months.',
  aboutFrontendRepo: 'Repositorio del frontend',
  aboutBackendRepo: 'Repositorio del backend',
  aboutSourceLink: 'Source',
  aboutEuProject: 'Made in EU',
  aboutMadeInCzechia: 'Czechia',
  aboutHostedInGermany: 'Servers in Germany',
  aboutTiersTitle: 'Voting limits (per hour)',
  aboutTierAnonymous: 'Anonymous',
  aboutTierRegistered: 'Registered',
  aboutTierSupporter: 'Supporter',
  aboutSupporterPriceNote: '€2.99 / month',
  aboutVotesPerHour: 'votes / hr',
  aboutVoteExpiry: 'Los votos caducan a las 24 horas, así que los rankings reflejan cómo se siente la gente ahora. Ganas nuevos votos cada hora. Cada voto cuenta una vez por tipo (▲ o ▼) dentro de tu límite por hora.',
  privacy: 'Privacy',
  privacyLastUpdated: 'Last updated: April 29, 2026',
  privacyOperatorTitle: 'Operator',
  privacyOperatorBody: 'Operator and data controller: Josef Jadrný, Czechia. Contact: bc.josefjadrny@gmail.com.',
  privacyDataTitle: 'What we collect',
  privacyDataBody: 'When you sign in: provider id, email, display name, avatar URL. When you vote: IP address, country code (from your IP), and your user id. Your preferences: chosen interface language and country override.',
  privacyWhyTitle: 'Why we collect it',
  privacyWhyBody: 'We collect this data only for the platform to function: to identify your account, prevent duplicate sign-ins, limit how many votes a single person or IP can cast per hour, show country breakdowns, and default your country and language correctly.',
  privacyCookiesTitle: 'Cookies',
  privacyCookiesBody: 'We set a single signed cookie that keeps you signed in. We do not use any analytics, advertising, or tracking cookies.',
  privacyThirdPartiesTitle: 'Third parties',
  privacyThirdPartiesBody: 'We do not sell, rent, or share your data. Servers run on Amazon Web Services in Frankfurt, Germany. Sign-in is handled by Google as identity provider — Google\'s privacy policy applies for that step. Cloudflare proxies traffic and detects your country from your IP.',
  privacyRetentionTitle: 'Retention',
  privacyRetentionVotes: 'Votes are deleted after 24 hours.',
  privacyRetentionProfiles: 'Profiles with no votes after 3 days are deleted automatically.',
  privacyRetentionAccounts: 'User accounts inactive for 6 months are deleted automatically.',
  privacyRightsTitle: 'Your rights',
  privacyRightsBody: 'Under GDPR you have the right to access, correct, or delete your data, or to object to processing. Contact us through support or by email at bc.josefjadrny@gmail.com. We respond within 30 days.',
  privacyOpenSupport: 'Open support',
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
  displayNameFormat: 'Solo letras minúsculas, números y guiones bajos (3–30 caracteres)',
  displayNameTaken: 'Este nombre ya está en uso',
  noCountryWarning: 'No pudimos detectar tu país. La votación está deshabilitada.',
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
    account: 'Cuenta',
    other: 'Otro',
  },
  supportStatuses: {
    new: 'Nuevo',
    investigating: 'Investigando',
    waiting: 'En espera',
    done: 'Resuelto',
  },
  roles: {
    politics: 'Política',
    culture: 'Cultura',
    sports: 'Deportes',
    business: 'Negocios',
    media: 'Medios',
    health: 'Salud',
    tech: 'Tecnología',
  },
  votesLeft: 'votos restantes',
  nextVote: 'próximo voto',
  agree: 'Me gusta',
  disagree: 'No me gusta',
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
