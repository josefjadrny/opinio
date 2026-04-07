import { useQuery } from '@tanstack/react-query';
import { getPersonBreakdown } from '../mock/handlers';

export function usePersonBreakdown(profileId: string | null) {
  return useQuery({
    queryKey: ['person-breakdown', profileId],
    queryFn: () => getPersonBreakdown(profileId!),
    enabled: profileId !== null,
    staleTime: 30_000,
  });
}
