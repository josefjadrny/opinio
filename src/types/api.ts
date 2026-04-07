import type { Profile } from './profile';

export interface ProfilesResponse {
  profiles: Profile[];
  recentlyAdded: Profile[];
}

export interface CountryProfilesResponse {
  positive: Profile[];
  negative: Profile[];
}

export interface VoteAllowance {
  like: {
    remaining: number;
    nextAt: string | null;
  };
  dislike: {
    remaining: number;
    nextAt: string | null;
  };
}

export interface MeResponse {
  voteAllowance: VoteAllowance;
}

export interface VoteResponse {
  profile: Profile;
  voteAllowance: VoteAllowance;
}

export interface ProfileFilters {
  type: 'positive' | 'negative';
  country?: string;
  role?: string;
}

export type VoteType = 'like' | 'dislike';

export interface CountryBreakdown {
  countryCode: string;
  count: number;
}

export interface PersonBreakdownResponse {
  topLiking: CountryBreakdown[];
  topDisliking: CountryBreakdown[];
}

export interface RealtimeEvent {
  kind: 'vote' | 'new_profile';
  profileId: string;
  data: Partial<Profile>;
}
