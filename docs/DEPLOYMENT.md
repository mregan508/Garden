# Deploying Garden Map

## Web app (mregan.xyz/garden)

The Next.js app uses `basePath: '/garden'`.

### URLs

| Page | Production | Local dev |
|------|------------|-----------|
| Garden map | https://mregan.xyz/garden | http://localhost:3000/garden |
| Sign in | https://mregan.xyz/garden/login | http://localhost:3000/garden/login |
| Auth confirm | https://mregan.xyz/garden/auth/confirm | http://localhost:3000/garden/auth/confirm |
| Activity feed | https://mregan.xyz/garden/activity | http://localhost:3000/garden/activity |
| Reminders | https://mregan.xyz/garden/reminders | http://localhost:3000/garden/reminders |
| Plant journal | https://mregan.xyz/garden/{placement-id}/journal | http://localhost:3000/garden/{id}/journal |

### 1. Vercel project

1. Import **https://github.com/mregan508/Garden** in [Vercel](https://vercel.com/new).
2. Root directory: repo root (uses root `vercel.json`) **or** `gardening-web` with matching settings.
3. Framework: **Next.js**.

Root `vercel.json` installs `@gardening/shared` before building `gardening-web`.

### 2. Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon public key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Yes | Mapbox public `pk.` token |
| `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL` | No | Override APK URL for login download button; defaults to GitHub Release v1.0.1 |

Apply to Production, Preview, and Development.

### 3. Custom domain (via protocols project)

**Do not** add `mregan.xyz` to the garden Vercel project. The apex domain is owned by the **protocols** project; `/garden` traffic is rewritten to this app's Vercel URL (`garden-zeta-nine.vercel.app`).

See protocols `docs/deployment/DOMAIN.md` for DNS/rewrite setup.

### 4. Supabase auth URLs

Authentication → URL Configuration:

| Setting | Production |
|---------|------------|
| Site URL | `https://mregan.xyz/garden` |
| Redirect URLs | `https://mregan.xyz/garden/auth/confirm` |

Local dev — also allow:

- `http://localhost:3000/garden`
- `http://localhost:3000/garden/auth/confirm`

### 5. Deploy web

Push to `main` for automatic Vercel deploy, or:

```bash
cd gardening-web
npx vercel --prod
```

---

## Android app

### Distribution model

- **Not** on Google Play — sideload via GitHub Releases
- CI builds a **standalone release APK** with the JS bundle embedded (no Metro required)
- Web login page links to the release asset **`garden-map.apk`**

### Build APK (GitHub Actions)

1. Add repository secrets (Settings → Secrets → Actions):
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

2. **Actions → Build Android APK → Run workflow** (branch `main`).

3. Download artifact **garden-map-apk** when complete (~20–30 min first run).

### Publish a release

Use [scripts/publish-android-release.ps1](../scripts/publish-android-release.ps1) or create manually:

1. Tag semver matching `gardening-app/app.json` version (e.g. `v1.0.1`).
2. Attach asset named exactly **`garden-map.apk`**.
3. Include SHA-256 checksum in release notes.
4. Mark as **pre-release** for sideload builds (optional).

**Current release:** https://github.com/mregan508/Garden/releases/tag/v1.0.1 (after rebuilding with fixed workflow)

> GitHub's `/releases/latest/` redirect **skips pre-releases**. The web app defaults to the pinned tag URL. Update `gardening-web/lib/androidAppDownload.ts` or set `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL` in Vercel when publishing a new version.

### Local development (Metro required)

If you run from source with `npx expo run:android`, start Metro first:

```bash
cd gardening-app && npm start
```

On a USB-connected device: `adb reverse tcp:8081 tcp:8081`

### Install on device

1. Download APK from release or web login button.
2. Enable install from unknown sources when prompted.
3. Open APK and install.
4. Sign in with the same Supabase account as the web app.

---

## Optional notes

- `mregan.xyz/` is served by the **protocols** app; gardening only occupies `/garden`.
- Weather uses Open-Meteo — no deploy-time API key needed.
