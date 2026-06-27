# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Garden Map mobile (`gardening-app`)

## Project context

- Expo SDK 56 + `@rnmapbox/maps` — **requires custom dev build**, not Expo Go
- Auth via `@gardening/shared` `AuthProvider`; `prepareNativeAuthSession` for stay-signed-in (AsyncStorage vs in-memory)
- Tabs: **Map**, **Activity**; login at `app/index.tsx`
- Map style: `mapbox://styles/mapbox/satellite-streets-v12`
- Shared business logic in `@gardening/shared` — keep screens thin
- Android APK distributed via GitHub Releases; CI in `.github/workflows/build-android-apk.yml`

## Conventions

- Env vars: `EXPO_PUBLIC_*` only (see `.env.example`)
- Mapbox init in `lib/mapbox.ts`
- Run `npm run verify` from repo root before pushing

## Docs

- [../README.md](../README.md) — features and setup
- [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) — Android build & release
- [../docs/PROJECT_MEMORY.md](../docs/PROJECT_MEMORY.md) — project history
