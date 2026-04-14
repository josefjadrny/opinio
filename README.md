# Opinio — Frontend

React frontend for [Opinio](https://opinio.live) — a global social voting platform where anyone can browse and vote for public figures from around the world, organized by country on an interactive world map.

## Tech Stack

| Concern | Library |
|---------|---------|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Map | react-simple-maps (SVG/TopoJSON) |
| Build | Vite |

## Running locally

Requires the API (`opinio-api`) running locally first.

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build     # production build
npm run preview   # preview production build
```

The API URL is configured via `OPINIO_API_URL` in `.env` (defaults to `http://localhost:3000`).

## Project Structure

```
src/
├── api/              # HTTP client — real fetch calls to the API
├── components/
│   ├── common/       # CountryFlag, RoleBadge
│   ├── filters/      # FilterBar
│   ├── layout/       # Sidebar (desktop), MobileFeed (mobile)
│   ├── map/          # WorldMap, CountryTooltip
│   ├── profile/      # ProfileCard, Avatar, PersonTooltip, NewBadge
│   ├── profile-form/ # AddProfileModal (2-step with autocomplete)
│   └── voting/       # VoteButtons
├── context/          # FilterContext (country + role filter state)
├── hooks/            # useProfiles, useVote, useMe, useCountryProfiles, ...
├── i18n/             # EN / CS — add locales in src/i18n/strings.ts
├── mock/             # Mock handlers for not-yet-implemented API endpoints
├── types/            # TypeScript interfaces
└── utils/            # countries, roles, formatNumber
```

## License

Source-available, not open-source. Viewing and PRs allowed; copying, forking, or redistributing is not permitted.
