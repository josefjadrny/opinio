import { useQuery } from '@tanstack/react-query';
import { getProfiles } from '../api/client';
import type { ProfileFilters } from '../types/api';

export function useProfiles(filters: ProfileFilters) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => getProfiles(filters),
    refetchInterval: 10_000,
  });
}
