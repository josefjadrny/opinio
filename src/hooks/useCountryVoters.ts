import { useQuery } from '@tanstack/react-query';
import { getCountryVoters, isNotFound } from '../api/client';

// Where the world stands on ONE country's opinios - drives the map tint while a
// /c/:code detail is open. The country-shaped sibling of useProfileCountries,
// and deliberately identical to it in every policy: same 30s poll against a 60s
// server cache, same no-retry on a dead code.
//
// Deliberately NO keepPreviousData, for the same reason: on a CZ -> DE switch it
// would hand back Czechia's numbers while Germany is in flight, fading in the
// wrong colours before correcting itself. The map holds its neutral no-data
// state for the duration instead - that is what the cross-fade is for.
export function useCountryVoters(code: string | null) {
  return useQuery({
    queryKey: ['country-voters', code],
    queryFn: () => getCountryVoters(code!),
    enabled: code !== null,
    staleTime: 30_000,
    refetchInterval: (query) => (isNotFound(query.state.error) ? false : 30_000),
    refetchIntervalInBackground: false,
    // An unknown code 400s; that's a dead route, not a blip worth retrying.
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 3,
  });
}
