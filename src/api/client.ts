import type {
  ProfilesResponse, CountryProfilesResponse, CountryDiscussedResponse, MeResponse,
  VoteResponse, ProfileFilters, VoteType, PersonBreakdownResponse,
  SupportTicket, UserDetailResponse, ProfileReportGroup,
} from '../types/api';

const API_URL = import.meta.env.OPINIO_API_URL as string;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isJson = init?.body != null && !(init.body instanceof FormData);
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? res.statusText), { status: res.status });
  }
  return res.json();
}

// apiFetch tags thrown errors with the HTTP status. For id-shaped endpoints a
// 404 (no such row) and a 400 (malformed id, e.g. /p/dhehdh) both mean "this
// isn't here" and will never succeed on retry - treat them as a terminal
// not-found. Other statuses (5xx, network) may be a transient blip.
export function isNotFound(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status;
  return status === 404 || status === 400;
}

export function getProfiles(filters: ProfileFilters, lang?: string): Promise<ProfilesResponse> {
  const params = new URLSearchParams({ type: filters.type });
  if (filters.country) params.set('country', filters.country);
  if (filters.roles?.length) params.set('roles', filters.roles.join(','));
  if (filters.fresh) params.set('fresh', '1');
  if (filters.search) params.set('q', filters.search);
  if (filters.limit != null) params.set('limit', String(filters.limit));
  if (lang) params.set('lang', lang);
  return apiFetch(`/api/profiles?${params}`);
}

export function getSearchSuggest(q: string, lang?: string): Promise<import('../types/api').SearchSuggestResponse> {
  const params = new URLSearchParams({ q });
  if (lang) params.set('lang', lang);
  return apiFetch(`/api/search/suggest?${params}`);
}

export function getCountryProfiles(countryCode: string, lang?: string): Promise<CountryProfilesResponse> {
  const qs = lang ? `?lang=${lang}` : '';
  return apiFetch(`/api/profiles/country/${countryCode}${qs}`);
}

export function getCountryDiscussed(countryCode: string, lang?: string): Promise<CountryDiscussedResponse> {
  const qs = lang ? `?lang=${lang}` : '';
  return apiFetch(`/api/profiles/country/${countryCode}/discussed${qs}`);
}

export function vote(profileId: string, type: VoteType): Promise<VoteResponse> {
  return apiFetch(`/api/profiles/${profileId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

export function getMe(): Promise<MeResponse> {
  return apiFetch('/api/me');
}

export function loginWithGoogle(): void {
  window.location.href = `${API_URL}/auth/google`;
}

export function loginWithMicrosoft(): void {
  window.location.href = `${API_URL}/auth/microsoft`;
}

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export function updateMe(fields: { countryCode?: string; displayName?: string; bio?: string; language?: string }): Promise<{ ok: boolean }> {
  return apiFetch('/api/me', {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export function uploadImage(blob: Blob): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.append('file', blob, 'photo.jpg');
  return apiFetch('/api/images', { method: 'POST', body: form });
}

// Per-opinio content image: raw upload (any of JPEG / PNG / WebP up to 10 MB).
// The server resizes to 720p JPEG and moderates with Rekognition in prod.
export function uploadContentImage(file: File): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.append('file', file, file.name || 'image');
  return apiFetch('/api/images/content', { method: 'POST', body: form });
}

export function uploadAvatar(blob: Blob): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', blob, 'avatar.jpg');
  return apiFetch('/api/me/avatar', { method: 'POST', body: form });
}

export function resetAvatar(): Promise<{ ok: boolean }> {
  return apiFetch('/api/me/avatar', { method: 'DELETE' });
}

export function addNewProfile(data: {
  name: string;
  role: string;
  countryCode: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  contentImageUrl?: string;
  contentImageKey?: string;
  link?: string;
  addedBy: string;
}): Promise<import('../types/profile').Profile> {
  return apiFetch('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getProfile(profileId: string, lang?: string): Promise<import('../types/profile').Profile> {
  const qs = lang ? `?lang=${lang}` : '';
  return apiFetch(`/api/profiles/${profileId}${qs}`);
}

// Outbound source-link URL for an opinio. Points at the API redirect endpoint
// (counts the click + keeps the raw URL behind our domain) rather than the raw
// link, which the client never receives. Used as an <a href> opened in a new tab.
export function profileLinkUrl(profileId: string): string {
  return `${API_URL}/l/${profileId}`;
}

export async function deleteProfile(profileId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/profiles/${profileId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? res.statusText), { status: res.status });
  }
}

export function getPersonBreakdown(profileId: string): Promise<PersonBreakdownResponse> {
  return apiFetch(`/api/profiles/${profileId}/breakdown`);
}

export function getUser(userId: string, lang?: string): Promise<UserDetailResponse> {
  const qs = lang ? `?lang=${lang}` : '';
  return apiFetch(`/api/users/${userId}${qs}`);
}

export interface CountryCounts {
  code: string;
  likes: number;
  dislikes: number;
}

export function getCountries(): Promise<{ countries: CountryCounts[] }> {
  return apiFetch('/api/countries');
}

// Per-country vote tally for ONE profile, used to tint the map while a profile
// detail is open. Same shape as getCountries so both feed the same colour memo,
// but the numbers mean something different: getCountries groups opinios by the
// country they are ABOUT, this groups votes by where the VOTER is.
export function getProfileCountries(profileId: string): Promise<{ countries: CountryCounts[] }> {
  return apiFetch(`/api/profiles/${profileId}/countries`);
}

export function getTopVoters(country?: string, metric: import('../types/api').VoterMetric = 'received'): Promise<import('../types/api').TopVotersResponse> {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (metric !== 'received') params.set('metric', metric);
  const qs = params.toString();
  return apiFetch(`/api/stats/top-voters${qs ? `?${qs}` : ''}`);
}

export function getTrendingProfiles(
  country?: string,
  metric: import('../types/api').CountryMetric = 'total',
  lang?: string,
): Promise<import('../types/api').TrendingProfilesResponse> {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (metric !== 'total') params.set('metric', metric);
  if (lang) params.set('lang', lang);
  const qs = params.toString();
  return apiFetch(`/api/stats/trending-profiles${qs ? `?${qs}` : ''}`);
}

export function getTrendingCountries(
  metric: import('../types/api').CountryMetric = 'total',
): Promise<import('../types/api').TrendingCountriesResponse> {
  return apiFetch(`/api/stats/trending-countries?metric=${metric}`);
}

// All-time Leaderboard: opinios ranked by lifetime votes received (combined).
export function getLeaderboardProfiles(
  country?: string,
  lang?: string,
): Promise<import('../types/api').LeaderboardProfilesResponse> {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (lang) params.set('lang', lang);
  const qs = params.toString();
  return apiFetch(`/api/stats/leaderboard-profiles${qs ? `?${qs}` : ''}`);
}

// All-time Leaderboard: countries ranked by lifetime votes received (combined).
export function getLeaderboardCountries(): Promise<import('../types/api').LeaderboardCountriesResponse> {
  return apiFetch('/api/stats/leaderboard-countries');
}

export function getSupportTickets(): Promise<SupportTicket[]> {
  return apiFetch('/api/support');
}

export function createSupportTicket(data: { title: string; description: string; category: string }): Promise<SupportTicket> {
  return apiFetch('/api/support', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSupportStatus(id: string, status: string): Promise<{ ok: boolean; status: string }> {
  return apiFetch(`/api/support/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function updateSupportReply(id: string, adminReply: string): Promise<{ ok: boolean }> {
  return apiFetch(`/api/support/${id}/reply`, { method: 'PATCH', body: JSON.stringify({ adminReply }) });
}

export function updateSupportNote(id: string, adminNote: string): Promise<{ ok: boolean }> {
  return apiFetch(`/api/support/${id}/note`, { method: 'PATCH', body: JSON.stringify({ adminNote }) });
}

export function reportProfile(profileId: string, reason: string): Promise<{ ok: boolean }> {
  return apiFetch(`/api/profiles/${profileId}/report`, { method: 'POST', body: JSON.stringify({ reason }) });
}

export function getReports(): Promise<ProfileReportGroup[]> {
  return apiFetch('/api/reports');
}

export function validateReportedProfile(profileId: string): Promise<{ ok: boolean }> {
  return apiFetch(`/api/reports/${profileId}/validate`, { method: 'POST', body: JSON.stringify({}) });
}

export function createCheckoutSession(): Promise<{ url: string }> {
  return apiFetch('/api/billing/checkout', { method: 'POST', body: JSON.stringify({}) });
}

export function createPortalSession(): Promise<{ url: string }> {
  return apiFetch('/api/billing/portal', { method: 'POST', body: JSON.stringify({}) });
}

// TODO: wire to wss://${API_URL}/ws once BE WebSocket is implemented
export { subscribe as subscribeRealtime } from '../mock/realtime';
