// Curated list used for profile filters (countries that can have profiles)
const COUNTRIES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AR: 'Argentina', AU: 'Australia',
  AT: 'Austria', BD: 'Bangladesh', BE: 'Belgium', BR: 'Brazil', BG: 'Bulgaria',
  CA: 'Canada', CL: 'Chile', CN: 'China', CO: 'Colombia', HR: 'Croatia',
  CU: 'Cuba', CZ: 'Czechia', DK: 'Denmark', EG: 'Egypt', FI: 'Finland',
  FR: 'France', DE: 'Germany', GR: 'Greece', HU: 'Hungary', IN: 'India',
  ID: 'Indonesia', IR: 'Iran', IQ: 'Iraq', IE: 'Ireland', IL: 'Israel',
  IT: 'Italy', JP: 'Japan', KE: 'Kenya', KR: 'South Korea', KP: 'North Korea',
  MX: 'Mexico', MA: 'Morocco', NL: 'Netherlands', NZ: 'New Zealand', NG: 'Nigeria',
  NO: 'Norway', PK: 'Pakistan', PE: 'Peru', PH: 'Philippines', PL: 'Poland',
  PT: 'Portugal', RO: 'Romania', RU: 'Russia', SA: 'Saudi Arabia', RS: 'Serbia',
  SG: 'Singapore', ZA: 'South Africa', ES: 'Spain', SE: 'Sweden', CH: 'Switzerland',
  TW: 'Taiwan', TH: 'Thailand', TR: 'Turkey', UA: 'Ukraine', AE: 'UAE',
  GB: 'United Kingdom', US: 'United States', VE: 'Venezuela', VN: 'Vietnam',
};

// Full display names for all countries in world-110m.json (used in map tooltips)
const ALL_COUNTRY_NAMES: Record<string, string> = {
  ...COUNTRIES,
  AM: 'Armenia', AO: 'Angola', AZ: 'Azerbaijan', BA: 'Bosnia and Herzegovina',
  BD: 'Bangladesh', BF: 'Burkina Faso', BJ: 'Benin', BO: 'Bolivia',
  BS: 'Bahamas', BT: 'Bhutan', BW: 'Botswana', BN: 'Brunei',
  BI: 'Burundi', BZ: 'Belize', BY: 'Belarus', CD: 'DR Congo',
  CF: 'Central African Republic', CG: 'Republic of Congo', CI: "Côte d'Ivoire",
  CM: 'Cameroon', CR: 'Costa Rica', CY: 'Cyprus', DJ: 'Djibouti',
  DO: 'Dominican Republic', EC: 'Ecuador', EE: 'Estonia', EH: 'Western Sahara',
  ER: 'Eritrea', ET: 'Ethiopia', FJ: 'Fiji', FK: 'Falkland Islands',
  GA: 'Gabon', GE: 'Georgia', GH: 'Ghana', GL: 'Greenland',
  GM: 'Gambia', GN: 'Guinea', GQ: 'Equatorial Guinea', GT: 'Guatemala',
  GW: 'Guinea-Bissau', GY: 'Guyana', HN: 'Honduras', HT: 'Haiti',
  IS: 'Iceland', JM: 'Jamaica', JO: 'Jordan', KG: 'Kyrgyzstan',
  KH: 'Cambodia', KW: 'Kuwait', KZ: 'Kazakhstan', LA: 'Laos',
  LB: 'Lebanon', LK: 'Sri Lanka', LR: 'Liberia', LS: 'Lesotho',
  LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', LY: 'Libya',
  MD: 'Moldova', ME: 'Montenegro', MG: 'Madagascar', MK: 'North Macedonia',
  ML: 'Mali', MM: 'Myanmar', MN: 'Mongolia', MR: 'Mauritania',
  MW: 'Malawi', MY: 'Malaysia', MZ: 'Mozambique', NA: 'Namibia',
  NC: 'New Caledonia', NE: 'Niger', NI: 'Nicaragua', NP: 'Nepal',
  OM: 'Oman', PA: 'Panama', PG: 'Papua New Guinea', PS: 'Palestine',
  PY: 'Paraguay', QA: 'Qatar', RW: 'Rwanda', SB: 'Solomon Islands',
  SD: 'Sudan', SL: 'Sierra Leone', SK: 'Slovakia', SI: 'Slovenia',
  SN: 'Senegal', SO: 'Somalia', SR: 'Suriname', SS: 'South Sudan',
  SV: 'El Salvador', SY: 'Syria', SZ: 'Eswatini', TD: 'Chad',
  TJ: 'Tajikistan', TL: 'Timor-Leste', TG: 'Togo', TM: 'Turkmenistan',
  TT: 'Trinidad and Tobago', TN: 'Tunisia', TZ: 'Tanzania', UG: 'Uganda',
  UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', YE: 'Yemen',
  ZM: 'Zambia', ZW: 'Zimbabwe',
};

export function getCountryName(code: string): string {
  return ALL_COUNTRY_NAMES[code] ?? code;
}

export function getCountryFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

const ALPHA3_TO_ALPHA2: Record<string, string> = {
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', ARG: 'AR', AUS: 'AU', AUT: 'AT',
  BGD: 'BD', BEL: 'BE', BRA: 'BR', BGR: 'BG', CAN: 'CA', CHL: 'CL',
  CHN: 'CN', COL: 'CO', HRV: 'HR', CUB: 'CU', CZE: 'CZ', DNK: 'DK',
  EGY: 'EG', FIN: 'FI', FRA: 'FR', DEU: 'DE', GRC: 'GR', HUN: 'HU',
  IND: 'IN', IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE', ISR: 'IL',
  ITA: 'IT', JPN: 'JP', KEN: 'KE', KOR: 'KR', PRK: 'KP', MEX: 'MX',
  MAR: 'MA', NLD: 'NL', NZL: 'NZ', NGA: 'NG', NOR: 'NO', PAK: 'PK',
  PER: 'PE', PHL: 'PH', POL: 'PL', PRT: 'PT', ROU: 'RO', RUS: 'RU',
  SAU: 'SA', SRB: 'RS', SGP: 'SG', ZAF: 'ZA', ESP: 'ES', SWE: 'SE',
  CHE: 'CH', TWN: 'TW', THA: 'TH', TUR: 'TR', UKR: 'UA', ARE: 'AE',
  GBR: 'GB', USA: 'US', VEN: 'VE', VNM: 'VN',
};

export function alpha3ToAlpha2(alpha3: string): string | undefined {
  return ALPHA3_TO_ALPHA2[alpha3];
}

// ISO 3166-1 numeric → alpha-2; covers all geometries in world-110m.json
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '024': 'AO', '032': 'AR',
  '036': 'AU', '040': 'AT', '031': 'AZ', '044': 'BS', '050': 'BD',
  '051': 'AM', '056': 'BE', '064': 'BT', '068': 'BO', '070': 'BA',
  '072': 'BW', '076': 'BR', '084': 'BZ', '090': 'SB', '096': 'BN',
  '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH',
  '120': 'CM', '124': 'CA', '140': 'CF', '144': 'LK', '148': 'TD',
  '152': 'CL', '156': 'CN', '158': 'TW', '170': 'CO', '178': 'CG',
  '180': 'CD', '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY',
  '203': 'CZ', '204': 'BJ', '208': 'DK', '214': 'DO', '218': 'EC',
  '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER', '233': 'EE',
  '238': 'FK', '242': 'FJ', '246': 'FI', '250': 'FR', '262': 'DJ',
  '266': 'GA', '268': 'GE', '270': 'GM', '275': 'PS', '276': 'DE',
  '288': 'GH', '300': 'GR', '304': 'GL', '320': 'GT', '324': 'GN',
  '328': 'GY', '332': 'HT', '340': 'HN', '348': 'HU', '352': 'IS',
  '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE',
  '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM', '392': 'JP',
  '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR',
  '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB', '426': 'LS',
  '428': 'LV', '430': 'LR', '434': 'LY', '440': 'LT', '442': 'LU',
  '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML',
  '478': 'MR', '484': 'MX', '496': 'MN', '498': 'MD', '499': 'ME',
  '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA', '524': 'NP',
  '528': 'NL', '540': 'NC', '548': 'VU', '554': 'NZ', '558': 'NI',
  '562': 'NE', '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA',
  '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL',
  '620': 'PT', '624': 'GW', '626': 'TL', '634': 'QA', '642': 'RO',
  '643': 'RU', '646': 'RW', '682': 'SA', '686': 'SN', '688': 'RS',
  '694': 'SL', '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO',
  '710': 'ZA', '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD',
  '732': 'EH', '740': 'SR', '748': 'SZ', '752': 'SE', '756': 'CH',
  '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '780': 'TT',
  '784': 'AE', '788': 'TN', '792': 'TR', '795': 'TM', '800': 'UG',
  '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB', '834': 'TZ',
  '840': 'US', '854': 'BF', '858': 'UY', '860': 'UZ', '862': 'VE',
  '887': 'YE', '894': 'ZM',
};

export function numericToAlpha2(id: string): string | undefined {
  return NUMERIC_TO_ALPHA2[id];
}

export const ALL_COUNTRIES = Object.entries(COUNTRIES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));
