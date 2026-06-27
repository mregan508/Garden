# Garden Map — Web

Next.js App Router app for the Garden Map monorepo. Served at **`/garden`** (`basePath` in `next.config.ts`).

**Production:** https://mregan.xyz/garden

## Setup

From repo root:

```bash
npm run install:all
cp .env.example .env.local   # if missing
# Fill Supabase + Mapbox keys in .env.local
```

## Dev

```bash
npm run dev
# → http://localhost:3000/garden
```

## Routes

| Path | Page |
|------|------|
| `/garden` | Satellite map, plant pins, sidebar |
| `/garden/login` | Sign in / sign up, stay signed in, Android download |
| `/garden/auth/confirm` | Email confirmation handler |
| `/garden/activity` | Recent journal + due reminders |
| `/garden/reminders` | All reminders |
| `/garden/[placementId]/journal` | Per-plant journal & reminders |

## Key paths

- `app/` — Next.js routes
- `components/` — `GardenMap`, `GardenWeather`, `PlantMapFilters`, auth providers
- `lib/supabase.ts` — Supabase client + stay-signed-in session prep
- `lib/androidAppDownload.ts` — APK download URL for login button
- `lib/basePath.ts` — auth redirect URLs

Shared logic lives in `packages/shared` (`@gardening/shared`).

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run type-check
```

## Deploy

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md). Vercel installs the shared package via root or `gardening-web/vercel.json`.
