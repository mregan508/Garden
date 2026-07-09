# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Garden Map

Garden planning app (map-based, Mapbox satellite view). Owner: Michael (mregan508), hobbyist — explain tradeoffs plainly.

## Structure

- `gardening-web/` — Next.js web app (has its own CLAUDE.md — read it before web work). `basePath: '/garden'` — all routes/assets live under `/garden`.
- `gardening-app/` — Expo / React Native mobile app; pushing to `main` auto-builds and publishes an Android APK (see `.github/workflows`)
- `packages/shared/` — `@gardening/shared`: auth, Supabase session handling, map business logic
- `supabase/` — Postgres migrations and local dev config
- `scripts/` — plant catalog import/generation, Android release publish
- `docs/DEPLOYMENT.md`, `docs/PROJECT_MEMORY.md` — deployment details and history

## Commands

Run from the repo root unless noted:

```bash
npm run install:all   # install all three workspaces (not npm install — this is not an npm workspaces monorepo)
npm run verify        # typecheck shared + web + mobile, lint web — run before every push
npm run typecheck     # typecheck only
npm run lint          # lint web only

cd gardening-web && npm run dev    # web dev server → http://localhost:3000/garden
cd gardening-app && npm start      # mobile (Expo)
```

- There is no test suite — `npm run verify` (typecheck + lint) is the whole check, and CI (`.github/workflows/ci.yml`) runs the same.
- Mobile maps (`@rnmapbox/maps`) need a custom dev build: `npx expo run:android`, not Expo Go.
- Env files (gitignored): `gardening-web/.env.local` (`NEXT_PUBLIC_*`), `gardening-app/.env` (`EXPO_PUBLIC_*`) — Supabase keys + Mapbox `pk.` token in each.

## Architecture

- **Shared-first:** all business logic (auth, garden placements/journal/reminders/watering, catalog, filters, weather) lives in `packages/shared/` as raw TypeScript, consumed via `file:` dependencies by both apps. Web and mobile are thin UI layers — put new logic in shared, import types/helpers from `@gardening/shared`, don't duplicate into an app.
- **Platform split via entry points:** shared exposes `supabase/client-web` vs `supabase/client-native` (storage/session handling differs); apps pick the right one. `scripts/prune-shared-react.mjs` (run by `install:all`) removes nested React copies from shared to avoid duplicate-React errors.
- **Database:** Supabase Postgres, hosted ref `chisciyfxhfndxyteesx`. Core tables: `garden_placements`, `plant_catalog`, `plant_catalog_variety`, `garden_journal_entries`, `garden_reminders` — all user data scoped by RLS to `auth.uid()`. Schema changes go in timestamped files under `supabase/migrations/`.

## Deployment

- Vercel project `garden-web` deploys from `main`. Production URL: **https://mregan.xyz/garden** — traffic reaches it via a rewrite that lives in the *Protocols* repo (`protocols-web/vercel.json`), because mregan.xyz belongs to the protocols Vercel project.
- Direct deployment URL (rewrite target): garden-zeta-nine.vercel.app
- Android: CI builds a release APK and publishes it as a GitHub Release (`garden-map.apk`); the web login page links to it.

## Workflow

- **Never commit or push directly to `main`.** Always create a feature branch and open a PR — Michael merges to `main`.
- Run `npm run verify` from the repo root before pushing.
- Remember: merging to `main` triggers both the web deploy **and** an Android APK release — there is no staging branch.
