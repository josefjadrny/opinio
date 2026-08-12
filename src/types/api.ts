import type { Profile, Role } from './profile';

export interface ProfilesResponse {
  profiles: Profile[];
}

export interface CountryProfilesResponse {
  positive: Profile[];
  negative: Profile[];
}

export interface CountryDiscussedResponse {
  profiles: Profile[];
}

// Search typeahead ("whisperer"). Users + opinios come from the API; country
// suggestions are matched client-side (translated names + /api/countries totals).
export interface SuggestUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  totalReceived: number;
}

export interface SearchSuggestResponse {
  users: SuggestUser[];
  profiles: Profile[];
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
  bio: string | null;
  tier: 'anonymous' | 'registered' | 'supporter' | 'admin';
  canChangeCountry: boolean;
  countryChangeAvailableAt: string | null;
  language: string | null;
  blockedUntil: string | null;
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
  roles?: string[];
  search?: string;
  limit?: number;
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

export type VoterMetric = 'given' | 'received';

export interface TopVoter {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  activeProfiles: number;
  totalLikesCast: number;
  totalDislikesCast: number;
  totalLikesReceived: number;
  totalDislikesReceived: number;
}

export interface TopVotersResponse {
  topVoters: TopVoter[];
}

export type CountryMetric = 'total' | 'likes' | 'dislikes' | 'net';

// Trending opinios: top profiles ranked by the selected metric, same Profile
// shape as the feed so the stats modal renders + links them identically.
export interface TrendingProfilesResponse {
  trendingProfiles: Profile[];
}

export interface TrendingCountry {
  countryCode: string;
  activeProfiles: number;
  totalLikes: number;
  totalDislikes: number;
}

export interface TrendingCountriesResponse {
  trendingCountries: TrendingCountry[];
}

// All-time Leaderboard: entities ranked by lifetime votes received
// (likes+dislikes combined), distinct from the 24h "trending" rankings above.
export type LeaderboardBoard = 'opinios' | 'countries' | 'users';

export interface LeaderboardProfilesResponse {
  leaderboardProfiles: Profile[];
}

export interface LeaderboardCountry {
  countryCode: string;
  profileCount: number;
  totalLikes: number;
  totalDislikes: number;
}

export interface LeaderboardCountriesResponse {
  leaderboardCountries: LeaderboardCountry[];
}

export interface UserProfileSummary {
  id: string;
  name: string;
  role: import('./profile').Role;
  imageUrl: string | null;
  countryCode: string;
  description: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

export interface UserDetailResponse {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  bio: string | null;
  createdAt: string;
  totalLikesReceived: number;
  totalDislikesReceived: number;
  profiles: UserProfileSummary[];
}

export type SupportTicketStatus = 'new' | 'investigating' | 'waiting' | 'done';
export type SupportTicketCategory = 'bug' | 'feature' | 'subscription' | 'account' | 'other';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  adminReply: string | null;
  adminNote?: string | null;
  userDisplayName?: string;
  userCountryCode?: string | null;
  userTier?: string | null;
  userAvatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReporterTier = 'anonymous' | 'registered' | 'supporter' | 'admin';

export interface ProfileReport {
  reason: string;
  reporterName: string | null;
  reporterTier: ReporterTier | null;
  createdAt: string;
}

export interface ProfileReportGroup {
  profileId: string;
  profileName: string;
  profileCountry: string | null;
  role: Role;
  reportCount: number;
  lastReportedAt: string;
  reports: ProfileReport[];
}

export interface RealtimeEvent {
  kind: 'vote' | 'new_profile';
  profileId: string;
  data: Partial<Profile>;
}
