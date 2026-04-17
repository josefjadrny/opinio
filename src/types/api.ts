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

export interface MeUser {
  id: string;
  displayName: string;
  provider: string | null;
  countryCode: string | null;
  avatarUrl: string | null;
  tier: 'anonymous' | 'registered' | 'supporter' | 'admin';
  canChangeCountry: boolean;
  language: string | null;
}

export interface MeResponse {
  user: MeUser;
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

export interface TopVoter {
  displayName: string;
  countryCode: string | null;
  totalLikesCast?: number;
  totalDislikesCast?: number;
}

export interface TopVotersResponse {
  topLikers: TopVoter[];
  topDislikers: TopVoter[];
}

export type SupportTicketStatus = 'new' | 'investigating' | 'waiting' | 'done';
export type SupportTicketCategory = 'bug' | 'feature' | 'billing' | 'other';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  adminReply: string | null;
  adminNote?: string | null;
  userDisplayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealtimeEvent {
  kind: 'vote' | 'new_profile';
  profileId: string;
  data: Partial<Profile>;
}
