# 2025-06-23 — Gardening app Phase 1 scaffold

- New repo: gardening-app (Expo), gardening-web (Next.js), packages/shared, supabase/
- Phase 1: garden_placements table, map pin CRUD, shared auth
- Phase 2 plant catalog documented in docs/PHASE2_PLANT_CATALOG.md

# 2026-06-23 — Supabase project provisioned

- Project: `gardening` (ref: `chisciyfxhfndxyteesx`, region: us-east-1)
- Migration `create_garden_placements` applied; RLS enabled
- Env files written: `gardening-web/.env.local`, `gardening-app/.env` (Supabase keys filled)
- Remaining manual keys: Mapbox token (web + mobile) — paste into `.env.local` / `.env`

# 2026-06-23 — Mapbox on mobile (Android + iOS)

- Replaced `react-native-maps` / Google Maps with `@rnmapbox/maps`
- Same `pk.` token as web: `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` in `gardening-app/.env`
- Requires custom dev build: `npx expo run:android` (not Expo Go)
