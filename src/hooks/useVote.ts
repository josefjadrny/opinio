import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vote } from '../api/client';
import type { VoteType, VoteResponse, MeResponse, ProfilesResponse } from '../types/api';
import type { Profile } from '../types/profile';
import { lockOrderFor5s } from '../utils/voteLock';

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, type }: { profileId: string; type: VoteType }) =>
      vote(profileId, type),
    onSuccess: (data: VoteResponse) => {
      // Immediately patch counts — order stays frozen for 5s, then unlock triggers invalidation
      const patch = (p: Profile) => p.id === data.profile.id ? data.profile : p;
      queryClient.setQueriesData<ProfilesResponse>({ queryKey: ['profiles'] }, (old) =>
        old ? { ...old, profiles: old.profiles.map(patch), recentlyAdded: old.recentlyAdded.map(patch) } : old
      );
      queryClient.setQueryData<Profile>(['profile', data.profile.id], data.profile);
      lockOrderFor5s(() => {
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
        queryClient.invalidateQueries({ queryKey: ['countryProfiles'] });
      });
      queryClient.setQueryData<MeResponse>(['me'], (old) =>
        old ? { ...old, voteAllowance: data.voteAllowance } : old
      );
    },
  });
}
