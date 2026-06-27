<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Garden Map web (`gardening-web`)

## Project context

- Monorepo web app; **`basePath: /garden`** — all routes and static assets are under `/garden`
- Auth via `@gardening/shared` `AuthProvider` + Supabase; `prepareWebAuthSession` handles stay-signed-in storage
- Map: `react-map-gl` + Mapbox satellite style; business logic in `@gardening/shared`
- Deployed on Vercel; production at `mregan.xyz/garden` via protocols project rewrites
- Run `npm run verify` from repo root before pushing

## Conventions

- Import shared types/helpers from `@gardening/shared`, not duplicated in web
- Use `authRedirectUrl()` from `lib/basePath.ts` for Supabase redirect URLs
- Form inputs: explicit `text-gray-900` / `bg-white` (light theme)
- Keep imports at top of file

## Docs

- [README.md](README.md) — routes and setup
- [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) — Vercel, env vars, Android APK URL
- [../docs/PROJECT_MEMORY.md](../docs/PROJECT_MEMORY.md) — project history
