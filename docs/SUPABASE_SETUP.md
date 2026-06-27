# Supabase setup

Hosted project ref: **`chisciyfxhfndxyteesx`** (us-east-1)

## 1. Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project (separate from Protocols).
2. Note the **Project URL** and **anon public** key from Settings → API.

## 2. Configure environment variables

```bash
cp gardening-web/.env.example gardening-web/.env.local
cp gardening-app/.env.example gardening-app/.env
```

Fill in Supabase and Mapbox values in both files:

| Variable | Apps |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL` | Web / mobile |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Web / mobile |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` / `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Web / mobile |

Optional web-only: `NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL` — override APK download link on login page.

## 3. Link CLI and apply migrations

From the repo root:

```bash
npm install supabase --save-dev   # or use npx supabase
npx supabase login
npx supabase link --project-ref chisciyfxhfndxyteesx
npx supabase db push
```

This applies every SQL file in `supabase/migrations/` including placements, catalog, varieties, journal, reminders, indoor flag, and security fixes.

## 4. Verify RLS

In the SQL editor, confirm RLS is enabled on user tables with policies scoped to `auth.uid() = user_id`:

- `garden_placements`
- `garden_journal_entries`
- `garden_reminders`

`plant_catalog` and `plant_catalog_variety` are readable by authenticated users.

## 5. Auth settings

> **"Email rate limit exceeded" on sign-up?** Hosted Supabase limits built-in email to ~3/hour on free plans. For development, disable **Confirm email** under Authentication → Providers → Email.

Ensure **Email** provider is enabled.

**Authentication → URL Configuration:**

| Setting | Local dev | Production |
|---------|-----------|------------|
| Site URL | `http://localhost:3000/garden` | `https://mregan.xyz/garden` |
| Redirect URLs | `http://localhost:3000/garden/auth/confirm` | `https://mregan.xyz/garden/auth/confirm` |

The web app sends confirmation links to `/auth/confirm`. That path must be in redirect URLs.

**Email confirmation options:**

- **Testing:** disable Confirm email — instant sign-in after sign-up
- **Production:** leave enabled — users confirm via email link

Local Supabase (`supabase start`): confirmation disabled in `supabase/config.toml`; mail captured in Inbucket (port 54324).

## Local development (optional)

```bash
npx supabase start
npx supabase db reset
```

Use the local URL and anon key from `supabase start` in your `.env` files.
