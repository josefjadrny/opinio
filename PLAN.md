# Pulse - Frontend MVP Plan

## Context
Building a global social voting platform where users add public figures and vote like/dislike on them. No comments, no chat - pure voting. UI centers on a world map (desktop) or ranked feed (mobile). Votes expire after 24 hours, keeping rankings fresh and reflecting current sentiment. Mock backend for now, real Node.js BE later.

## Key Decisions
- **Map**: react-simple-maps (free, no API key, country-level)
- **Vote TTL**: 24 hours (BE concern)
- **Vote allowance**: 1 like + 1 dislike per hour (separate pools)
- **Votes are final**: no undo, no toggle
- **Discovery**: Recently added entries mixed into sidebars with "New" badge
- **Content**: Creator-only descriptions (max 255 chars), no edits, no comments
- **Mobile**: No map, combined feed
- **Real-time**: Mock WS events every 2-5s, production WebSocket later
- **FE is dumb**: renders what BE provides, no business logic on client

## API Endpoints
| Endpoint | Purpose |
|---------|---------|
| `GET /profiles?type=positive&country=US&role=politician` | Ranked profiles + recently added |
| `GET /profiles/country/:code` | Country tooltip data |
| `POST /profiles/:id/vote` | Cast vote, returns updated profile + allowance |
| `POST /profiles` | Add new profile |
| `GET /me` | Session info (vote allowance, extensible) |
