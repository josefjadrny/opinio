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

export function getCountryName(code: string): string {
  return COUNTRIES[code] ?? code;
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

const NAME_TO_ALPHA2: Record<string, string> = {
  'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Argentina': 'AR',
  'Australia': 'AU', 'Austria': 'AT', 'Bangladesh': 'BD', 'Belgium': 'BE',
  'Brazil': 'BR', 'Bulgaria': 'BG', 'Canada': 'CA', 'Chile': 'CL',
  'China': 'CN', 'Colombia': 'CO', 'Croatia': 'HR', 'Cuba': 'CU',
  'Czechia': 'CZ', 'Denmark': 'DK', 'Egypt': 'EG', 'Finland': 'FI',
  'France': 'FR', 'Germany': 'DE', 'Greece': 'GR', 'Hungary': 'HU',
  'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ',
  'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT', 'Japan': 'JP',
  'Kenya': 'KE', 'South Korea': 'KR', 'North Korea': 'KP', 'Mexico': 'MX',
  'Morocco': 'MA', 'Netherlands': 'NL', 'New Zealand': 'NZ', 'Nigeria': 'NG',
  'Norway': 'NO', 'Pakistan': 'PK', 'Peru': 'PE', 'Philippines': 'PH',
  'Poland': 'PL', 'Portugal': 'PT', 'Romania': 'RO', 'Russia': 'RU',
  'Saudi Arabia': 'SA', 'Serbia': 'RS', 'Singapore': 'SG', 'South Africa': 'ZA',
  'Spain': 'ES', 'Sweden': 'SE', 'Switzerland': 'CH', 'Taiwan': 'TW',
  'Thailand': 'TH', 'Turkey': 'TR', 'Ukraine': 'UA',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB',
  'United States of America': 'US', 'Venezuela': 'VE', 'Vietnam': 'VN',
  // Additional countries from topojson
  'Angola': 'AO', 'Armenia': 'AM', 'Azerbaijan': 'AZ', 'Belarus': 'BY',
  'Bolivia': 'BO', 'Cambodia': 'KH', 'Cameroon': 'CM', 'Ecuador': 'EC',
  'Estonia': 'EE', 'Ethiopia': 'ET', 'Georgia': 'GE', 'Ghana': 'GH',
  'Guatemala': 'GT', 'Iceland': 'IS', 'Jamaica': 'JM', 'Jordan': 'JO',
  'Kazakhstan': 'KZ', 'Kuwait': 'KW', 'Latvia': 'LV', 'Lebanon': 'LB',
  'Libya': 'LY', 'Lithuania': 'LT', 'Malaysia': 'MY', 'Mongolia': 'MN',
  'Myanmar': 'MM', 'Namibia': 'NA', 'Nepal': 'NP', 'Nicaragua': 'NI',
  'Oman': 'OM', 'Panama': 'PA', 'Paraguay': 'PY', 'Qatar': 'QA',
  'Sri Lanka': 'LK', 'Sudan': 'SD', 'Syria': 'SY', 'Tanzania': 'TZ',
  'Tunisia': 'TN', 'Uganda': 'UG', 'Uruguay': 'UY', 'Yemen': 'YE',
  'Zambia': 'ZM', 'Zimbabwe': 'ZW',
};

export function nameToAlpha2(name: string): string | undefined {
  return NAME_TO_ALPHA2[name];
}

export const ALL_COUNTRIES = Object.entries(COUNTRIES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));
