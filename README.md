# Pulse Earth

A global social voting platform where anyone can browse and vote for public figures from around the world, organized by country on an interactive world map. Rankings are always fresh — votes expire after 24 hours, making this a living snapshot of current sentiment, not a historical archive.

---

## Current Status

The **frontend is complete with a mock backend** (`src/mock/`). The real Node.js/PostgreSQL backend is not yet implemented. See [Backend Specification](#backend-specification) below for the full production design.

---

## Concept

- **World map** (desktop) or **ranked feed** (mobile) of public figures
- Each entry has a short creator-written description (max 255 chars) — no edits, no comments
- **Like / Dislike** voting — 1 like + 1 dislike per hour per IP (separate pools), votes are final (no undo)
- Votes expire after **24 hours**, keeping rankings fresh and reflecting current sentiment
- **Rising** sidebar: top ranked by net positive score (likes − dislikes)
- **Falling** sidebar: most disliked (highest dislike count in last 24h)
- **New** badge on recently added entries, interleaved into ranked lists
- Duplicate prevention: autocomplete matching on both name and description (trigram similarity)
- Community moderation: submissions start as `pending`, auto-approve at threshold
- Real-time score updates via WebSocket

---

## Layout

```
+-------------------+----------------------------+-------------------+
|                   |                            |                   |
|   LEFT SIDEBAR    |       WORLD MAP (SVG)      |  RIGHT SIDEBAR    |
|   Rising          |       fills remaining      |  Falling          |
|   net score rank  |                            |  most disliked    |
|                   |   Hover country →          |                   |
|   Infinite scroll |   tooltip: top 5 entries   |  Infinite scroll  |
|   +like  -dislike |   from that country        |  +like  -dislike  |
+-------------------+----------------------------+-------------------+
```

Mobile (<768px): no map, combined Rising/Falling feed.

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
├── context/          # FilterContext (country + role filter state)
├── hooks/            # useProfiles, useVote, useMe, useRealtimeUpdates, ...
├── i18n/             # I18nContext + strings (EN / CS — add locales here)
├── mock/             # Mock backend: data, handlers, realtime WS simulator, storage
├── types/            # TypeScript interfaces (Profile, API responses)
└── utils/            # countries (ISO numeric → alpha-2), roles, formatNumber
```

### Tech Stack

| Concern | Library |
|---------|---------|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Map | react-simple-maps (SVG/TopoJSON, no tile server, no API key) |
| Build | Vite |

### Key Frontend Decisions

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

## Backend Specification

> Not yet implemented. This section documents the production backend design.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 with `pg_trgm` extension |
| Images | AWS S3 + `sharp` for server-side resizing |
| Deployment | Docker Compose (PostgreSQL + Node + nginx) |

### Voting Rules

- **Vote types**: like and dislike are separate pools
- **Allowance**: 1 like per IP per hour + 1 dislike per IP per hour
- **Per-person limit**: 1 like OR 1 dislike per person per IP (can't vote the same person twice)
- **Votes are final**: no undo, no toggle
- **Votes expire after 24 hours** — cleanup job deletes them hourly; user can vote again after expiry
- IP from `X-Forwarded-For` (first entry) or `req.ip`
- `like_count` / `dislike_count` on `people` are incremented atomically on each vote

### Moderation

- Submissions start as `pending` — hidden from all feeds
- Community moderation at `/pending`: approve/reject buttons, 1 vote per IP per entry
- Auto-approve at `MODERATION_APPROVE_THRESHOLD` (default: 5) → status becomes `approved`
- Auto-reject at `MODERATION_REJECT_THRESHOLD` (default: 5) → status becomes `rejected`

### API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/people/rising?cursor=&limit=20` | Rising: sorted by net score (likes − dislikes) |
| `GET` | `/api/people/falling?cursor=&limit=20` | Falling: sorted by dislike count (24h) |
| `GET` | `/api/people/search?q=&cursor=&limit=20` | Name/country search |
| `GET` | `/api/people/country/:code` | Top 5 for map tooltip |
| `GET` | `/api/people/autocomplete?name=&description=&limit=5` | Trigram duplicate detection |
| `POST` | `/api/people` | Submit new person (multipart) |
| `POST` | `/api/people/:id/vote` | Cast vote `{ vote_type: 'like' \| 'dislike' }` |
| `GET` | `/api/people/pending` | Moderation queue |
| `POST` | `/api/people/:id/moderate` | Cast moderation vote |
| `GET` | `/api/me` | Session info (hourly vote allowance remaining) |

All list endpoints use **cursor-based pagination**: `cursor={value}_{id}`, response includes `next_cursor: string | null`.

### Autocomplete (Duplicate Detection)

The submit form queries trigram similarity on both name and description as the user types, showing up to 5 existing matches with a **"Vote for this person instead"** button.

### Image Upload

1. Client validates: jpeg/png/webp, ≤512KB
2. Sent as multipart FormData
3. Server resizes to 200×200 thumbnail via `sharp` (cover, center, JPEG q80)
4. Uploads original + thumbnail to S3 (`images/{uuid}.jpg`, `thumbnails/{uuid}.jpg`)
5. Both URLs stored on the `people` record

### Deployment

Docker Compose with three services: PostgreSQL, Node.js Express API, nginx serving the Vite build.

Required env vars: `DB_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `MODERATION_APPROVE_THRESHOLD`, `MODERATION_REJECT_THRESHOLD`.

---

## Roadmap

- [ ] Real Node.js + PostgreSQL backend (see spec above)
- [ ] Authentication (Login button is a placeholder)
- [ ] WebSocket production implementation
- [ ] Autocomplete duplicate detection in submit form
- [ ] Community moderation view (`/pending`)
- [ ] Image upload to S3
- [ ] More locales (extend `src/i18n/strings.ts`)
