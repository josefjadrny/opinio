import { type ReactElement } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ModalShell } from '../common/ModalShell';
import { SelectField } from '../common/SelectField';
import { Avatar } from '../profile/Avatar';
import { useI18n } from '../../i18n/I18nContext';
import { useFilters } from '../../context/useFilters';
import {
  useLeaderboardCountries, useLeaderboardProfiles,
  useTopVoters, useTrendingCountries, useTrendingProfiles,
} from '../../hooks/useTopVoters';
import { getCountryFlag, getCountryName, getCountriesList } from '../../utils/countries';
import { FlagImg } from '../common/CountryFlag';
import { RoleBadge } from '../common/RoleBadge';
import type { CountryMetric, LeaderboardBoard } from '../../types/api';
import type { Profile } from '../../types/profile';
import type { StatsCategory } from './statsCategory';

export type { StatsCategory };
type Category = StatsCategory;

interface StatsModalProps {
  category: StatsCategory;
  onClose: () => void;
}

// Category <-> URL path. /stats is the canonical Trending Opinios page; the
// other two get their own keyword paths. Filters (country/metric) ride in query
// params and are canonicalled away, so these 3 stay the only indexable stats URLs.
const CATEGORY_PATH: Record<StatsCategory, string> = {
  profiles: '/stats',
  countries: '/stats/trending-countries',
  voters: '/stats/top-voters',
};

const VALID_METRICS: CountryMetric[] = ['total', 'likes', 'dislikes', 'net'];
const VALID_BOARDS: LeaderboardBoard[] = ['opinios', 'countries', 'users'];

const StatsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Trending Opinios glyph - replaces the 🔥 emoji with the app's two-tone
// outline style (same Heroicons family + brand red/green as the menu icons).
// Outer flame in dislike-red, inner flame in like-green: a vote-coloured fire.
const FlameIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
  </svg>
);

// Trending Countries glyph - replaces the 🌍 emoji, same two-tone treatment.
// Outer globe ring in dislike-red, equator + meridian grid in like-green.
const GlobeIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#ef4444" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
  </svg>
);

// Top Voters glyph - replaces the 🏆 emoji. Two-tone outline trophy:
// opinio-green cup + handles (upper) over an opinio-red stem + base
// (pedestal) - the brand's two colours split top/bottom.
const TrophyIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l-1.5 5a4.5 4.5 0 01-9 0L6 4zM6.5 5H5a2 2 0 000 4h1.2M17.5 5H19a2 2 0 010 4h-1.2" />
    <path stroke="#e94560" strokeLinecap="round" strokeLinejoin="round" d="M12 13.5V17M8.5 20h7l-1.5-3h-4l-1.5 3z" />
  </svg>
);

// Total keeps the existing bar-chart stats glyph (same shape as StatsIcon, sized
// down). Likes/Dislikes/Net reuse the app's ▲ / ▼ vote markers in the brand
// green/red - the same glyphs ProfileCard, tooltips and detail modals use.
const TotalMetricIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#e94560" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const LikeMetricIcon = () => <span className="text-positive text-xs leading-none">▲</span>;
const DislikeMetricIcon = () => <span className="text-negative text-xs leading-none">▼</span>;
const NetMetricIcon = () => (
  <span className="text-xs leading-none tracking-[-0.25em]">
    <span className="text-positive">▲</span>
    <span className="text-negative">▼</span>
  </span>
);

const METRIC_ICON: Record<CountryMetric, () => ReactElement> = {
  total: TotalMetricIcon,
  likes: LikeMetricIcon,
  dislikes: DislikeMetricIcon,
  net: NetMetricIcon,
};

// Leaderboard board glyphs (two-tone, same family as the category tabs).
// Opinios = a vote-coloured speech bubble; Countries reuses the globe; Users =
// a two-tone people glyph (green head over red shoulders).
const OpiniosBoardIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#e94560" strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4-.84L3 20l1.4-3.5A7.6 7.6 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

const UsersBoardIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
    <path stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    <path stroke="#e94560" strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

const BOARD_ICON: Record<LeaderboardBoard, () => ReactElement> = {
  opinios: OpiniosBoardIcon,
  countries: GlobeIcon,
  users: UsersBoardIcon,
};

function rankCell(i: number) {
  if (i === 0) return <span className="text-sm">🥇</span>;
  if (i === 1) return <span className="text-sm">🥈</span>;
  if (i === 2) return <span className="text-sm">🥉</span>;
  return <span className="text-xs text-white/50">{i + 1}</span>;
}

interface StatsRowProps {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  rank: number;
  subtitle: string | null;
  value: number;
  valueLabel: string;
}

function StatsRow({ id, displayName, avatarUrl, countryCode, rank, subtitle, value, valueLabel }: StatsRowProps) {
  const location = useLocation();
  return (
    <Link
      to={`/u/${id}${location.search}`}
      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
    >
      <span className="w-5 shrink-0 text-center">{rankCell(rank)}</span>
      <Avatar name={displayName} imageUrl={avatarUrl} className="w-7 h-7" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          @{displayName}
          {countryCode && <FlagImg code={countryCode} className="inline-block align-middle ml-1.5 shrink-0" />}
        </p>
        {subtitle && (
          <p className="text-[11px] text-white/50 truncate leading-tight">{subtitle}</p>
        )}
      </div>
      <span className="text-xs font-medium tabular-nums shrink-0 text-white/80">
        {value.toLocaleString()} <span className="text-white/50">{valueLabel}</span>
      </span>
    </Link>
  );
}

interface StatsCountryRowProps {
  countryCode: string;
  rank: number;
  subtitle: string | null;
  value: number;
  valueLabel: string;
}

function StatsCountryRow({ countryCode, rank, subtitle, value, valueLabel }: StatsCountryRowProps) {
  const location = useLocation();
  const { locale } = useI18n();
  return (
    <Link
      to={`/c/${countryCode}${location.search}`}
      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
    >
      <span className="w-5 shrink-0 text-center">{rankCell(rank)}</span>
      <span className="w-7 h-7 shrink-0 flex items-center justify-center"><FlagImg code={countryCode} /></span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{getCountryName(countryCode, locale)}</p>
        {subtitle && (
          <p className="text-[11px] text-white/50 truncate leading-tight">{subtitle}</p>
        )}
      </div>
      <span className="text-xs font-medium tabular-nums shrink-0 text-white/80">
        {value.toLocaleString()} <span className="text-white/50">{valueLabel}</span>
      </span>
    </Link>
  );
}

// An opinio (profile) row: rank medal + card image, the statement as title
// (with role pill), the country flag + name as subtitle, and the selected
// metric's value on the right. Clicks open the opinio at /p/:id. Shared by the
// Trending Opinios tab and the all-time Opinios leaderboard.
function StatsProfileRow({ profile, rank, value, valueLabel }: { profile: Profile; rank: number; value: number; valueLabel: string }) {
  const location = useLocation();
  const { locale } = useI18n();
  return (
    <Link
      to={`/p/${profile.id}${location.search}`}
      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
    >
      <span className="w-5 shrink-0 text-center">{rankCell(rank)}</span>
      <Avatar name={profile.name} imageUrl={profile.imageUrl} className="w-7 h-7" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{profile.name}</p>
        <div className="flex items-center gap-1.5 leading-tight min-w-0">
          <RoleBadge role={profile.role} />
          <FlagImg code={profile.countryCode} className="shrink-0" />
          <span className="text-[11px] text-white/50 truncate">{getCountryName(profile.countryCode, locale)}</span>
        </div>
      </div>
      <span className="text-xs font-medium tabular-nums shrink-0 text-white/80">
        {value.toLocaleString()} <span className="text-white/50">{valueLabel}</span>
      </span>
    </Link>
  );
}

function CategoryTabs({ category, onChange, t }: { category: Category; onChange: (c: Category) => void; t: ReturnType<typeof useI18n>['t'] }) {
  const tab = (key: Category, label: string, icon?: ReactElement) => {
    const active = category === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
          active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };
  return (
    <div className="flex gap-1 p-0.5 bg-black/20 border border-border rounded-lg overflow-x-auto no-scrollbar">
      {tab('profiles', t.statsCategoryProfiles, <FlameIcon />)}
      {tab('countries', t.statsCategoryCountries, <GlobeIcon />)}
      {tab('voters', t.statsCategoryVoters, <TrophyIcon />)}
    </div>
  );
}

// Segmented control mirroring CategoryTabs, but with opinio glyphs per metric
// (a native <select> can't render the SVG icons or their brand colors).
function MetricTabs({ metric, onChange, t }: { metric: CountryMetric; onChange: (m: CountryMetric) => void; t: ReturnType<typeof useI18n>['t'] }) {
  const tab = (key: CountryMetric, label: string) => {
    const Icon = METRIC_ICON[key];
    const active = metric === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
          active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        <Icon />
        {label}
      </button>
    );
  };
  return (
    <div className="flex gap-1 p-0.5 bg-black/20 border border-border rounded-lg overflow-x-auto no-scrollbar">
      {tab('total', t.statsMetricTotal)}
      {tab('likes', t.statsMetricLikes)}
      {tab('dislikes', t.statsMetricDislikes)}
      {tab('net', t.statsMetricNet)}
    </div>
  );
}

// The Leaderboard tab's entity picker: which all-time ranking to show
// (opinios / countries / users), all ranked by lifetime votes received.
function BoardTabs({ board, onChange, t }: { board: LeaderboardBoard; onChange: (b: LeaderboardBoard) => void; t: ReturnType<typeof useI18n>['t'] }) {
  const tab = (key: LeaderboardBoard, label: string) => {
    const Icon = BOARD_ICON[key];
    const active = board === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
          active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        <Icon />
        {label}
      </button>
    );
  };
  return (
    <div className="flex gap-1 p-0.5 bg-black/20 border border-border rounded-lg overflow-x-auto no-scrollbar">
      {tab('opinios', t.statsBoardOpinios)}
      {tab('users', t.statsBoardUsers)}
      {tab('countries', t.statsBoardCountries)}
    </div>
  );
}

// Maps the selected metric to the value + label shown for a row, from its
// like/dislike totals. Shared by the trending-opinios and trending-countries
// rankings — both rank by the same total|likes|dislikes|net metric.
function metricValue(totalLikes: number, totalDislikes: number, metric: CountryMetric, t: ReturnType<typeof useI18n>['t']) {
  switch (metric) {
    case 'likes':
      return { value: totalLikes, valueLabel: t.statsLikes };
    case 'dislikes':
      return { value: totalDislikes, valueLabel: t.statsDislikes };
    case 'net':
      return { value: totalLikes - totalDislikes, valueLabel: t.statsNet };
    default:
      return { value: totalLikes + totalDislikes, valueLabel: t.statsVotes };
  }
}

function StatsContent({ category, t }: { category: StatsCategory; t: ReturnType<typeof useI18n>['t'] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { country, setCountry } = useFilters();

  const isVoters = category === 'voters';
  const isCountries = category === 'countries';
  const isProfiles = category === 'profiles';

  // ?metric= drives the two Trending tabs (total|likes|dislikes|net). Switching
  // tabs always clears metric so each tab starts at its own default.
  const rawMetric = searchParams.get('metric');
  const metric: CountryMetric = VALID_METRICS.includes(rawMetric as CountryMetric)
    ? (rawMetric as CountryMetric)
    : 'total';
  const setMetric = (m: CountryMetric) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (m === 'total') next.delete('metric'); else next.set('metric', m);
      return next;
    }, { replace: true });
  };

  // ?board= drives the Leaderboard tab's entity picker (opinios|countries|users),
  // all ranked by lifetime votes received. Canonicalled away like ?metric=.
  const rawBoard = searchParams.get('board');
  const board: LeaderboardBoard = VALID_BOARDS.includes(rawBoard as LeaderboardBoard)
    ? (rawBoard as LeaderboardBoard)
    : 'opinios';
  const setBoard = (b: LeaderboardBoard) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (b === 'opinios') next.delete('board'); else next.set('board', b);
      return next;
    }, { replace: true });
  };

  // Tab clicks change the path. Always clear metric + board so each tab's
  // default applies.
  const goToCategory = (cat: StatsCategory) => {
    const params = new URLSearchParams(location.search);
    params.delete('metric');
    params.delete('board');
    const qs = params.toString();
    navigate(`${CATEGORY_PATH[cat]}${qs ? `?${qs}` : ''}`, { replace: true });
  };

  // The Leaderboard tab hides the country filter on the Countries board (ranking
  // countries by a single country is meaningless), like Trending Countries.
  const showCountryFilter = isProfiles || (isVoters && board !== 'countries');

  // Trending tabs.
  const profiles = useTrendingProfiles(isProfiles ? country : undefined, metric);
  const countries = useTrendingCountries(metric);
  // Leaderboard boards — each only fetches when it's the active board.
  const lbUsers = useTopVoters(board === 'users' ? country : undefined, 'received', isVoters && board === 'users');
  const lbProfiles = useLeaderboardProfiles(board === 'opinios' ? country : undefined, isVoters && board === 'opinios');
  const lbCountries = useLeaderboardCountries(isVoters && board === 'countries');

  const profileRows = profiles.data?.trendingProfiles ?? [];
  const countryRows = countries.data?.trendingCountries ?? [];
  const lbUserRows = lbUsers.data?.topVoters ?? [];
  const lbProfileRows = lbProfiles.data?.leaderboardProfiles ?? [];
  const lbCountryRows = lbCountries.data?.leaderboardCountries ?? [];

  // Active query for the current tab/board drives loading + empty state.
  const active = isProfiles ? profiles
    : isCountries ? countries
    : board === 'users' ? lbUsers
    : board === 'countries' ? lbCountries
    : lbProfiles;
  const activeCount = isProfiles ? profileRows.length
    : isCountries ? countryRows.length
    : board === 'users' ? lbUserRows.length
    : board === 'countries' ? lbCountryRows.length
    : lbProfileRows.length;
  const isLoading = active.isLoading;
  const isEmpty = activeCount === 0;

  const description = isProfiles ? t.statsProfilesDescription
    : isCountries ? t.statsCountriesDescription
    : board === 'users' ? t.statsBoardUsersDescription
    : board === 'countries' ? t.statsBoardCountriesDescription
    : t.statsBoardOpiniosDescription;

  const countryFilter = (
    <div>
      <label className="block text-xs font-medium text-white/80 mb-1.5">{t.country}</label>
      <SelectField value={country ?? ''} onChange={(e) => setCountry(e.target.value || undefined)}>
        <option value="" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>{t.allCountries}</option>
        {getCountriesList(locale).map(({ code, name }) => (
          <option key={code} value={code} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
            {getCountryFlag(code)} {name}
          </option>
        ))}
      </SelectField>
    </div>
  );

  return (
    <div className="px-6 py-5 space-y-4">
      <CategoryTabs category={category} onChange={goToCategory} t={t} />

      {/* Trending tabs pick a metric; the Leaderboard tab picks an entity board.
          The country filter shows on both Trending Opinios and the Leaderboard's
          Opinios/Users boards, and is hidden where a country ranking makes it
          meaningless (both Countries views). */}
      {isVoters ? (
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1.5">{t.statsBoardLabel}</label>
          <BoardTabs board={board} onChange={setBoard} t={t} />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1.5">{t.statsMetricLabel}</label>
          <MetricTabs metric={metric} onChange={setMetric} t={t} />
        </div>
      )}
      {showCountryFilter && countryFilter}

      <p className="text-xs text-white/50 leading-snug">{description}</p>

      {/* The list sizes to its content (LIMIT=10 server-side). Only the
          loading/empty placeholders get a small min-height so they don't look
          cramped; a full pool fills naturally without reserving dead space,
          which on a thin pool or mobile would leave a big empty block. */}
      <div>
      {isLoading ? (
        <p className="text-sm text-white/50 text-center py-16 min-h-[8rem]">{t.loading}</p>
      ) : isEmpty ? (
        <p className="text-sm text-white/50 text-center py-16 min-h-[8rem]">{t.statsNoData}</p>
      ) : (
        <div className="space-y-0.5">
          {isProfiles &&
            profileRows.map((p, i) => {
              const { value, valueLabel } = metricValue(p.likes, p.dislikes, metric, t);
              return (
                <StatsProfileRow key={p.id} profile={p} rank={i} value={value} valueLabel={valueLabel} />
              );
            })}
          {isCountries &&
            countryRows.map((c, i) => {
              const { value, valueLabel } = metricValue(c.totalLikes, c.totalDislikes, metric, t);
              return (
                <StatsCountryRow
                  key={c.countryCode}
                  countryCode={c.countryCode}
                  rank={i}
                  subtitle={`${c.activeProfiles} ${t.statsPostsLabel}`}
                  value={value}
                  valueLabel={valueLabel}
                />
              );
            })}
          {isVoters && board === 'opinios' &&
            lbProfileRows.map((p, i) => (
              <StatsProfileRow
                key={p.id}
                profile={p}
                rank={i}
                value={(p.totalLikes ?? 0) + (p.totalDislikes ?? 0)}
                valueLabel={t.statsVotes}
              />
            ))}
          {isVoters && board === 'countries' &&
            lbCountryRows.map((c, i) => (
              <StatsCountryRow
                key={c.countryCode}
                countryCode={c.countryCode}
                rank={i}
                subtitle={`${c.profileCount} ${t.statsOpiniosLabel}`}
                value={c.totalLikes + c.totalDislikes}
                valueLabel={t.statsVotes}
              />
            ))}
          {isVoters && board === 'users' &&
            lbUserRows.map((v, i) => (
              <StatsRow
                key={v.id}
                id={v.id}
                displayName={v.displayName}
                avatarUrl={v.avatarUrl}
                countryCode={v.countryCode}
                rank={i}
                subtitle={`${v.activeProfiles} ${t.statsPostsLabel}`}
                value={v.totalLikesReceived + v.totalDislikesReceived}
                valueLabel={t.statsVotes}
              />
            ))}
        </div>
      )}
      </div>
    </div>
  );
}

export function StatsModal({ category, onClose }: StatsModalProps) {
  const { t } = useI18n();

  return (
    <ModalShell onClose={onClose} title={t.statsTitle} titleAs="h1" icon={<StatsIcon />} maxWidth="max-w-lg" desktopScrollable>
      <StatsContent category={category} t={t} />
    </ModalShell>
  );
}
