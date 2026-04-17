import { useQuery } from '@tanstack/react-query';
import { getTopVoters } from '../api/client';

export function useTopVoters(country?: string) {
  return useQuery({
    queryKey: ['top-voters', country ?? null],
    queryFn: () => getTopVoters(country),
    staleTime: 60_000,
  });
}
