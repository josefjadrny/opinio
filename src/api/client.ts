import type {
  ProfilesResponse, CountryProfilesResponse, MeResponse,
  VoteResponse, ProfileFilters, VoteType, PersonBreakdownResponse,
} from '../types/api';

const API_URL = import.meta.env.OPINIO_API_URL as string;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body != null;
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
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

export function getProfiles(filters: ProfileFilters): Promise<ProfilesResponse> {
  const params = new URLSearchParams({ type: filters.type });
  if (filters.country) params.set('country', filters.country);
  if (filters.role) params.set('role', filters.role);
  return apiFetch(`/api/profiles?${params}`);
}

export function getCountryProfiles(countryCode: string): Promise<CountryProfilesResponse> {
  return apiFetch(`/api/profiles/country/${countryCode}`);
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

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export function updateMe(fields: { countryCode?: string; displayName?: string }): Promise<{ ok: boolean }> {
  return apiFetch('/api/me', {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export function uploadImage(blob: Blob): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', blob, 'photo.jpg');
  return apiFetch('/api/images', { method: 'POST', body: form });
}

// TODO: wire to POST /api/profiles once implemented in BE
export { addNewProfile } from '../mock/handlers';

export function getPersonBreakdown(profileId: string): Promise<PersonBreakdownResponse> {
  return apiFetch(`/api/profiles/${profileId}/breakdown`);
}

// TODO: wire to wss://${API_URL}/ws once BE WebSocket is implemented
export { subscribe as subscribeRealtime } from '../mock/realtime';
