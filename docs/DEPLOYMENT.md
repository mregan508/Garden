# Deploying the web app to mregan.xyz/garden

The Next.js app uses `basePath: '/garden'`, so production URLs look like:

| Page | URL |
|------|-----|
| Garden map | https://mregan.xyz/garden |
| Sign in | https://mregan.xyz/garden/login |
| Auth confirm | https://mregan.xyz/garden/auth/confirm |
| Plant journal | https://mregan.xyz/garden/{placement-id}/journal |

Local dev uses the same paths: http://localhost:3000/garden

## 1. Vercel project

1. Push this repo to GitHub (if not already).
2. In [Vercel](https://vercel.com/new), import the repository.
3. Set **Root Directory** to `gardening-web`.
4. Framework preset: **Next.js** (detected automatically).

The included `gardening-web/vercel.json` installs `@gardening/shared` from the monorepo before building.

## 2. Environment variables

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox public `pk.` token |

Apply to **Production**, **Preview**, and **Development**.

## 3. Custom domain

1. Vercel → Project → Settings → Domains → Add `mregan.xyz`.
2. At your domain registrar, point DNS to Vercel (A record `76.76.21.21` or CNAME to `cname.vercel-dns.com` — Vercel shows the exact values when you add the domain).
3. Wait for DNS propagation and SSL provisioning.

The app is served under `/garden` on whatever host you attach (including `*.vercel.app` preview URLs).

## 4. Supabase auth URLs

In Supabase → Authentication → URL Configuration:

| Setting | Production value |
|---------|------------------|
| Site URL | `https://mregan.xyz/garden` |
| Redirect URLs | `https://mregan.xyz/garden/auth/confirm` |

For local development, also allow:

- `http://localhost:3000/garden`
- `http://localhost:3000/garden/auth/confirm`

## 5. Deploy

Connect Git for automatic deploys on push, or deploy manually from `gardening-web`:

```bash
cd gardening-web
npx vercel --prod
```

After deploy, open https://mregan.xyz/garden and sign in.

## Optional: root domain page

`mregan.xyz/` is not part of this Next.js app. To add a personal landing page at the root later, use a separate Vercel project or a static `public/index.html` on another host — this gardening app only occupies `/garden`.
