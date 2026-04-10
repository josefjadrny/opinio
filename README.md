# Opinio — Frontend (opinio-fe)

A global social voting platform where anyone can browse and vote for public figures from around the world, organized by country on an interactive world map.

---

## Frontend Architecture

```
src/
├── api/              # HTTP client (fetch wrapper)
├── components/
│   ├── common/       # CountryFlag, RoleBadge
│   ├── filters/      # FilterBar, CountryFilter, RoleFilter
│   ├── layout/       # Sidebar (desktop), MobileFeed (mobile)
│   ├── map/          # WorldMap, CountryTooltip
│   ├── profile/      # ProfileCard, NewBadge
│   ├── profile-form/ # AddProfileModal (2-step with autocomplete)
│   └── voting/       # VoteButtons
├── context/          # FilterContext + useFilters hook (country + role filter state)
├── hooks/            # useProfiles, useVote, useMe, useRealtimeUpdates, ...
├── i18n/             # I18nContext + strings (EN / CS — add locales here)
├── mock/             # Mock backend: data, handlers, realtime WS simulator, storage
├── types/            # TypeScript interfaces (Profile, API responses)
└── utils/            # countries (ISO numeric → alpha-2), roles, formatNumber
```

## Tech Stack

| Concern | Library |
|---------|---------|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Map | react-simple-maps (SVG/TopoJSON, no tile server, no API key) |
| Build | Vite |

## Key Decisions

- **FE is dumb** — no business logic on the client; renders what the backend provides
- **Country lookup**: uses ISO 3166-1 numeric IDs from `geo.id` (not name strings) for reliable country matching across all 177 TopoJSON geometries
- **Sidebar width**: user-resizable (260–500px), persisted in `localStorage`
- **i18n**: all strings go through `useI18n()` — add a locale by extending `src/i18n/strings.ts`
- **Mock WS**: `src/mock/realtime.ts` emits fake score updates every 2–5s; replace with real WebSocket in production

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

---

## License

Source-available, not open-source. Viewing and PRs allowed; copying, forking, or redistributing is not permitted.
