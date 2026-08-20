import { useQuery } from '@tanstack/react-query';
import { getProfileCountries, isNotFound } from '../api/client';

// Per-country vote tally for one profile — drives the map tint while a profile
// detail is open (desktop only; the mobile map sits behind the detail sheet and
// would never be seen, so nothing calls this there).
//
// Deliberately NO keepPreviousData: on an A -> B profile switch it would hand
// back A's counts while B is in flight, and the map would fade in the wrong
// country colours before correcting itself. WorldMap holds the neutral no-data
// state for the duration instead, which is what the cross-fade is for.
export function useProfileCountries(profileId: string | null) {
  return useQuery({
    queryKey: ['profile-countries', profileId],
    queryFn: () => getProfileCountries(profileId!),
    enabled: profileId !== null,
    staleTime: 30_000,
    // Server caches this for 60s, so polling at 30s keeps the map moving without
    // ever costing more than one aggregate per minute per profile.
    refetchInterval: (query) => (isNotFound(query.state.error) ? false : 30_000),
    refetchIntervalInBackground: false,
    // Mirror useProfile: a 404/400 is a dead id, so don't retry it.
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 3,
  });
}
