import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vote } from '../api/client';
import type { VoteType, VoteResponse, MeResponse, ProfilesResponse, UserDetailResponse } from '../types/api';
import type { Profile } from '../types/profile';
import { lockOrderFor5s } from '../utils/voteLock';

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, type }: { profileId: string; type: VoteType }) =>
      vote(profileId, type),
    onSuccess: (data: VoteResponse, vars) => {
      // Immediately patch counts - order stays frozen for 5s, then unlock triggers invalidation.
      // Patch ONLY the vote counts: the vote endpoint returns the untranslated
      // original name/description (no ?lang handling, no originalName/sourceLang),
      // so merging the whole profile would clobber the cached translated text -
      // flipping the sidebar back to the original language for the 5s lock window
      // and breaking the "see original" toggle in the detail modal.
      const patch = (p: Profile) =>
        p.id === data.profile.id ? { ...p, likes: data.profile.likes, dislikes: data.profile.dislikes } : p;
      queryClient.setQueriesData<ProfilesResponse>({ queryKey: ['profiles'] }, (old) =>
        old ? { ...old, profiles: old.profiles.map(patch) } : old
      );
      // The detail modal also shows the lifetime totals beside the 24h counts.
      // The vote response carries only the live counts, so bump the lifetime
      // side that was just voted by hand - the vote is already committed, and
      // without this the "(302)" sits a poll behind the number next to it.
      queryClient.setQueriesData<Profile>({ queryKey: ['profile', data.profile.id] }, (old) =>
        old
          ? {
              ...old,
              likes: data.profile.likes,
              dislikes: data.profile.dislikes,
              totalLikes: old.totalLikes != null && vars.type === 'like' ? old.totalLikes + 1 : old.totalLikes,
              totalDislikes: old.totalDislikes != null && vars.type === 'dislike' ? old.totalDislikes + 1 : old.totalDislikes,
            }
          : old
      );
      // Deliberately NOT invalidated here. The patch above already holds the
      // server's own post-vote counts, while GET /api/profiles/:id is served
      // from a 5s in-process cache that the vote does not bust - so an
      // immediate refetch answers with the PRE-vote numbers and overwrites the
      // patch, leaving the detail modal showing the old total until the 10s
      // poll in useProfile lands. That poll reconciles anyway.
      queryClient.setQueriesData<UserDetailResponse>({ queryKey: ['user'] }, (old) => {
        if (!old) return old;
        const profilesPatched = old.profiles.some((p) => p.id === data.profile.id)
          ? old.profiles.map((p) => p.id === data.profile.id ? { ...p, likes: data.profile.likes, dislikes: data.profile.dislikes } : p)
          : old.profiles;
        // Received totals belong to the profile's author — bump them when the
        // user page being viewed is that author's.
        const isAuthorDetail = data.profile.addedById !== null && old.id === data.profile.addedById;
        return {
          ...old,
          profiles: profilesPatched,
          totalLikesReceived: isAuthorDetail && vars.type === 'like' ? old.totalLikesReceived + 1 : old.totalLikesReceived,
          totalDislikesReceived: isAuthorDetail && vars.type === 'dislike' ? old.totalDislikesReceived + 1 : old.totalDislikesReceived,
        };
      });
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
