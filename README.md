# Gardening App

Interactive garden map app — place and save plant locations on an aerial map overlay.

## Structure

- `gardening-app/` — Expo / React Native mobile app
- `gardening-web/` — Next.js web app
- `packages/shared/` — `@gardening/shared` types, auth, Supabase helpers
- `supabase/` — migrations and local dev config

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Copy env examples and fill in credentials (see **Env files** below):
   - `gardening-web/.env.local` (copy from `.env.example` if missing)
   - `gardening-app/.env` (copy from `.env.example` if missing)
3. Get a [Mapbox access token](https://account.mapbox.com/) and add it to both env files (same `pk.` token).

### Env files (not visible in Explorer by default)

`.env` and `.env.local` are gitignored, so your editor may hide them. They already exist in this repo:

| App | File | Variable |
|-----|------|----------|
| Web | `gardening-web/.env.local` | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` |
| Mobile | `gardening-app/.env` | `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` |

Paste your Mapbox `pk.` token after the `=` on each line, then restart the dev server.

**Mobile note:** `@rnmapbox/maps` requires a custom dev build (`npx expo run:android`), not Expo Go.
4. Apply migrations: see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
5. Install dependencies in each package:

```bash
cd packages/shared && npm install
cd ../../gardening-web && npm install
cd ../gardening-app && npm install
```

## Run

```bash
# Web (http://localhost:3000/garden)
cd gardening-web && npm run dev

# Mobile
cd gardening-app && npm start
```

## Phase 1

- Email/password auth (Supabase)
- Satellite map with plant pins (name + lat/lng)
- Sync across web and mobile via `garden_placements` table

## Phase 2

- Reference `plant_catalog` table with 100 plants (light, water, companions, NE climate notes)
- Optional `plant_catalog_id` link on map pins — custom names still supported
- Catalog search when adding or editing plants (web + mobile)
- **Plant journal** per pin: planted, watered, fertilized, fungicide, insecticide, budding, fruiting, harvest, pruning, transplant, notes
- Seed import: `node scripts/import-plants.mjs` (requires service role key)

See [docs/PHASE2_PLANT_CATALOG.md](docs/PHASE2_PLANT_CATALOG.md).

## Deploy (web)

Production URL: **https://mregan.xyz/garden** — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, DNS, and Supabase auth settings.
