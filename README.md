# Garden Map

Interactive garden map app — place plants on a satellite map, track care in a journal, and sync across web and Android.

**Production web:** https://mregan.xyz/garden  
**GitHub:** https://github.com/mregan508/Garden  
**Android (sideload):** [GitHub Release v1.0.0](https://github.com/mregan508/Garden/releases/tag/v1.0.0) or the **Download Android app** button on the login page

## Structure

| Path | Purpose |
|------|---------|
| `gardening-web/` | Next.js web app (`basePath: /garden`) |
| `gardening-app/` | Expo / React Native mobile app (Android + iOS) |
| `packages/shared/` | `@gardening/shared` — types, auth, Supabase helpers, weather, filters |
| `supabase/` | Postgres migrations and local dev config |
| `scripts/` | Plant import, catalog variety generators, Android release publish |
| `.github/workflows/` | CI (`verify`) and Android APK build |

## Setup

1. Create a [Supabase](https://supabase.com) project (hosted ref: `chisciyfxhfndxyteesx`).
2. Copy env examples and fill in credentials:
   - `gardening-web/.env.local` ← `.env.example`
   - `gardening-app/.env` ← `.env.example`
3. Add a [Mapbox](https://account.mapbox.com/) public `pk.` token to both env files.
4. Apply migrations — see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
5. Install dependencies:

```bash
npm run install:all
```

### Env files (gitignored)

| App | File | Key variables |
|-----|------|---------------|
| Web | `gardening-web/.env.local` | `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` |
| Mobile | `gardening-app/.env` | `EXPO_PUBLIC_SUPABASE_*`, `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` |

Optional web override for Android download URL: `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL`

**Mobile note:** `@rnmapbox/maps` requires a custom dev build (`npx expo run:android`), not Expo Go.

## Run

```bash
# Web → http://localhost:3000/garden
cd gardening-web && npm run dev

# Mobile
cd gardening-app && npm start
```

## Verify (local / CI)

```bash
npm run verify   # typecheck shared + web + mobile, lint web
```

GitHub Actions runs the same on every push/PR to `main`. Await `.github/workflows/build-android-apk.yml` for manual Android APK builds.

## Current features

### Auth & accounts

- Email/password auth (Supabase)
- Email confirmation flow at `/auth/confirm` (web)
- **Stay signed in** on login (web checkbox, mobile switch) — persistent vs session storage
- Web login **Download Android app** button → GitHub Release APK

### Garden map

- Mapbox satellite map with draggable plant pins (web + mobile)
- Address search / geocoding
- **Adjust locations** mode to reposition pins
- **Indoor / outdoor** flag per plant (indoor plants skip rain auto-water)
- Catalog search with **100+ species** and **cultivar/subspecies** picker
- Custom plant names still supported without catalog link
- **Filter & search** plants: name, catalog type, care status (overdue / due soon / no reminders)
- Compact marker mode (web)

### Care & journal

- Per-plant **journal**: planted, watered, fertilized, fungicide, insecticide, budding, fruiting, harvest, pruning, transplant, notes
- **Recurring reminders** per plant (water, fertilize, fungicide, insecticide, pruning)
- **Activity feed** (web `/activity`, mobile Activity tab) — recent journal + due reminders
- **Reminders page** (web `/reminders`) — garden-wide reminder list
- **Mark all plants watered** (one tap)
- **Rain auto-water** — marks outdoor plants watered when substantial rain is forecast (once per day)

### Weather

- 5-day garden forecast via [Open-Meteo](https://open-meteo.com/) (no extra API key)
- Location from plant-pin centroid or map center
- Indoor/outdoor context in weather UI

### Android distribution

- CI workflow builds debug APK (`Actions → Build Android APK`)
- Releases published on GitHub with `garden-map.apk` asset
- Publish script: `scripts/publish-android-release.ps1`

## Database (Supabase)

Core tables: `garden_placements`, `plant_catalog`, `plant_catalog_variety`, `garden_journal_entries`, `garden_reminders`. All user data scoped by RLS to `auth.uid()`.

See [docs/PHASE2_PLANT_CATALOG.md](docs/PHASE2_PLANT_CATALOG.md) for catalog/schema details.

## Deploy

- **Web:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Vercel, `mregan.xyz/garden` rewrites, Supabase auth URLs
- **Android:** GitHub Actions + Releases (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#android-app))

## Docs index

| Doc | Contents |
|-----|----------|
| [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) | Chronological project decisions and milestones |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Web + Android production deployment |
| [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Supabase project, migrations, auth |
| [docs/PHASE2_PLANT_CATALOG.md](docs/PHASE2_PLANT_CATALOG.md) | Plant catalog schema and import |
