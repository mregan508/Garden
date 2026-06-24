# Supabase setup

## 1. Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project (separate from Protocols).
2. Note the **Project URL** and **anon public** key from Settings → API.

## 2. Configure environment variables

```bash
# gardening-web/.env.local
cp gardening-web/.env.example gardening-web/.env.local

# gardening-app/.env
cp gardening-app/.env.example gardening-app/.env
```

Fill in `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your project values.

For maps:

- **Web:** `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` from [mapbox.com](https://account.mapbox.com/)
- **Mobile:** `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (same public `pk.` token as web)

## 3. Link CLI and apply migrations

From the repo root:

```bash
npm install supabase --save-dev   # or use npx supabase
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

This applies every SQL file in `supabase/migrations/` in timestamp order (placements, catalog, journal, indoor flag, and later additions).

## 4. Verify RLS

In the Supabase SQL editor, confirm:

- `garden_placements` exists with RLS enabled
- Four policies for SELECT / INSERT / UPDATE / DELETE scoped to `auth.uid() = user_id`

## 5. Auth settings

> **"Email rate limit exceeded" on sign-up?** This is not a password issue. Hosted Supabase sends a confirmation email on every sign-up attempt and limits built-in email to about **3 per hour** on free plans. Repeated testing hits that cap quickly.
>
> **Fix for development:** Authentication → [Sign In / Providers → Email](https://supabase.com/dashboard/project/_/auth/providers) → turn off **Confirm email**. Sign-up will work immediately with no email sent.

In Authentication → Providers, ensure **Email** is enabled.

In **Authentication → URL Configuration**:

| Setting | Value (local dev) |
|---------|-------------------|
| Site URL | `http://localhost:3000/garden` |
| Redirect URLs | `http://localhost:3000/garden/auth/confirm` |

For production at **mregan.xyz/garden**, see [DEPLOYMENT.md](DEPLOYMENT.md).

The web app sends new users a confirmation email that links to `/auth/confirm`. That route must be allowed as a redirect URL or confirmation will fail.

**Email confirmation (choose one):**

- **Recommended for testing:** Authentication → Sign In / Providers → Email → disable **Confirm email**. New accounts sign in immediately after sign-up.
- **Production-style:** leave confirmation enabled. Users click the link in their email, land on `/auth/confirm`, and are redirected to the garden map.

For local Supabase (`supabase start`), email confirmation is disabled in `supabase/config.toml` and test mail goes to Inbucket on port 54324.

## Local development (optional)

```bash
npx supabase start
npx supabase db reset
```

Use the local URL and anon key printed by `supabase start` in your `.env` files.
