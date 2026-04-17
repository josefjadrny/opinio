# Opinio — Frontend

React frontend for [Opinio](https://opinio.live) — a global social voting platform where anyone can browse and vote for public figures from around the world, organized by country on an interactive world map. Rankings refresh every 24 hours as votes expire, keeping results a live snapshot of current sentiment.

## Tech Stack

| Concern | Library |
|---------|---------|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Map | react-simple-maps (SVG/TopoJSON, no API key) |
| Build | Vite |

## Running locally

Requires the API (`opinio-api`) running locally first.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

The API URL is configured via `OPINIO_API_URL` in `.env` (defaults to `http://localhost:3000`).

## Features

- **World map** (desktop) / **ranked feed** (mobile) of public figures
- **Rising** sidebar — top net positive scores; **Falling** sidebar — most disliked
- **Like / Dislike** voting with per-tier hourly allowances
- **Nominate** — add a public figure with role, description, and avatar
- **Country tooltip** — hover a country on the map to see top 4 rising + falling
- **Person breakdown** — hover a card to see top fan/critic countries
- **Google OAuth** — sign in to unlock higher vote allowance and settings
- **Settings modal** — display name, country override, language preference
- **Stats page** — community leaderboard (top likers + dislikers), country filter
- **Support page** — submit tickets, track status; admin sees all tickets with user info
- **i18n** — English, Czech, Spanish; language synced server-side for registered users
- **Animated vote counters** — smooth animation toward new value over 10 s poll window
- **10 s profile polling** — standalone interval immune to realtime cache resets

## Project Structure

```
src/
├── api/              # HTTP client — fetch wrappers for all API endpoints
├── components/
│   ├── common/       # CountryFlag, RoleBadge
│   ├── filters/      # FilterBar, ProfileMenu, SettingsModal, AboutModal,
│   │                 #   StatsModal, SupportModal
│   ├── layout/       # Sidebar (desktop), MobileFeed (mobile)
│   ├── map/          # WorldMap, CountryTooltip
│   ├── profile/      # ProfileCard, Avatar, PersonTooltip, NewBadge,
│   │                 #   ProfileDetailModal
│   ├── profile-form/ # AddProfileModal (avatar upload + role picker)
│   └── voting/       # VoteButtons, VoteBanner
├── context/          # FilterContext — country + role filter via URL search params
├── hooks/            # useProfiles, useVote, useMe, useSupport, ...
├── i18n/             # Locale strings — add new locales in src/i18n/strings.ts
├── mock/             # Mock handlers for unimplemented endpoints (WebSocket)
├── types/            # TypeScript interfaces (api.ts, profile.ts)
└── utils/            # countries, roles, formatNumber
```

## User Tiers

| Tier | Votes / hour | Notes |
|------|-------------|-------|
| Anonymous | 1 | Identified by IP |
| Registered | 3 | Google OAuth |
| Supporter | 5 | Paid tier (coming soon) |
| Admin | 5 | Full support ticket management |

## License

Source-available, not open-source. Viewing and PRs welcome; copying, forking, or redistributing is not permitted.
