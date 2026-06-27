# Project memory

Chronological notes for agents and contributors. See [README.md](../README.md) for the current feature summary.

---

## 2025-06-23 — Phase 1 scaffold

- Monorepo: `gardening-app` (Expo), `gardening-web` (Next.js), `packages/shared`, `supabase/`
- Phase 1: `garden_placements` table, map pin CRUD, shared Supabase auth
- Phase 2 plant catalog planned — see [PHASE2_PLANT_CATALOG.md](PHASE2_PLANT_CATALOG.md)

## 2026-06-23 — Supabase project provisioned

- Hosted project ref: **`chisciyfxhfndxyteesx`** (region us-east-1)
- Migration `create_garden_placements` applied; RLS enabled
- Env files: `gardening-web/.env.local`, `gardening-app/.env`

## 2026-06-23 — Mapbox on mobile

- Replaced `react-native-maps` with **`@rnmapbox/maps`**
- Same public `pk.` token as web (`EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`)
- Requires custom dev build — **not Expo Go** (`npx expo run:android`)

## 2026-06-23 — Web production on mregan.xyz/garden

- GitHub repo: **`mregan508/Garden`**
- Vercel project deploys `gardening-web` with `basePath: /garden`
- Apex domain `mregan.xyz` owned by **protocols** project; `/garden` rewritten to garden Vercel app
- Root `vercel.json` installs shared package and runs Next.js build
- Supabase auth: Site URL + redirect URLs must include `/garden` prefix

## 2026-06-23 — Phase 2: plant catalog & journal

- `plant_catalog` (100+ Northeast US–focused species), optional `plant_catalog_id` on pins
- `plant_catalog_variety` — cultivars for all catalog species
- `garden_journal_entries` — per-pin care log
- Catalog search + variety picker on web and mobile

## 2026-06-23 — Care reminders & activity feed

- `garden_reminders` — recurring care per placement (water, fertilize, fungicide, insecticide, pruning)
- Web: `/activity`, `/reminders`; mobile: Activity tab
- Journal entries can advance reminder schedules

## 2026-06-23 — Weather, filters, watering

- Garden weather forecast (Open-Meteo, no API key)
- Map filters: search, catalog type, care status
- **Mark all watered** button
- **Rain auto-water** for outdoor plants on substantial-rain days (stored per user/day in local storage)
- **Indoor plant flag** (`is_indoor`) — indoor plants exempt from rain auto-water

## 2026-06-23 — Map UX

- **Adjust locations** mode to drag pins without deleting
- **Dots only** compact markers (web)
- Address geocoding shared via `@gardening/shared/mapbox/geocode`

## 2026-06-23 — Repo hygiene & CI

- Root `npm run verify` (typecheck + lint)
- GitHub Actions CI on push/PR to `main`
- `.editorconfig`, `.gitattributes`

## 2026-06-27 — Stay signed in

- Login option on web (checkbox) and mobile (switch)
- Unchecked: web uses `sessionStorage`, mobile uses in-memory auth storage
- Preference persisted for next login (`packages/shared/auth/stay-signed-in.ts`)

## 2026-06-27 — Android sideload distribution

- Web login **Download Android app** button
- GitHub Actions workflow: `.github/workflows/build-android-apk.yml` (debug APK via Gradle)
- First release: **`v1.0.0`** pre-release with asset `garden-map.apk`
- Production download URL pinned to tagged release (GitHub `/releases/latest/` skips pre-releases)
- Publish helper: `scripts/publish-android-release.ps1`
- Local APK output gitignored under `releases/`

## Conventions

- **Do not** commit `.env` files or APK binaries
- **Do not** add `mregan.xyz` apex to garden Vercel project — use protocols rewrites
- Mapbox mobile requires native build; web uses `react-map-gl`
- Shared business logic lives in `packages/shared` — keep web/mobile thin
