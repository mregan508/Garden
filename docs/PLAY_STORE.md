# Publishing Garden Map on Google Play

What the repo already handles, and the steps only the owner can do (accounts,
keys, store listing). Google changes Play Console requirements from time to time.
If a step here doesn't match what the Console shows, follow the Console.

## How builds work

Play Store builds are made with **EAS** (Expo's cloud build service), the same way as
the Protocols app. EAS creates and stores the app signing ("upload") key, so there is
no key file to keep. The GitHub Actions workflow still builds the sideload APK for
GitHub Releases. That APK is signed with a throwaway key and is **not** for Play.

## Already done in the repo

| Play requirement | Where |
|---|---|
| Permanent package name `xyz.mregan.gardenmap` | `gardening-app/app.json` → `android.package` (**never change it after the first upload**) |
| App bundle (`.aab`), increasing versionCode | `gardening-app/eas.json` `production` profile (`app-bundle`, `autoIncrement`, version kept by EAS) |
| Shared package installs on EAS | `eas-build-post-install` script in `gardening-app/package.json` (EAS only installs the app folder; this also installs `packages/shared`) |
| Privacy policy URL | https://mregan.xyz/garden/privacy |
| In-app account deletion | "Delete account" under Sign out (mobile + web), backed by `delete_my_account()` in Supabase (applied) |
| Account-deletion web URL | https://mregan.xyz/garden/delete-account |

## 1. Create the Expo project

On https://expo.dev (same account as Protocols): **Create a project**, with the slug
**`garden`** (it must match `slug` in `app.json`). Copy its **project ID** into
`app.json` → `expo.extra.eas.projectId` (via a PR).

## 2. Add the build environment variables on Expo

expo.dev → the Garden project → **Environment variables** → add each for the
**production** environment (same values as `gardening-app/.env`):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

Without them the app builds but can't sign in or show the map.

## 3. Build the Play bundle

From `gardening-app/` on your computer (after pulling `main`):

```bash
npx eas-cli@latest build --platform android --profile production
```

The first time, answer **Yes** to "Generate a new Android Keystore?". Expo stores it.
When the build finishes, download the `.aab` from the link it prints (or expo.dev → Builds).

## 4. Create the app in Play Console

Use the same Play developer account as Protocols.

1. **Create app**: name "Garden Map", App, Free.
2. **App content** section (all required):
   - **Privacy policy:** `https://mregan.xyz/garden/privacy`
   - **App access:** sign-in is required, so give reviewers a **test account**
     (create one on the web with a throwaway email) with a few plants on it.
   - **Ads:** No ads.
   - **Content rating:** fill in the questionnaire (no violence, no user-to-user chat, etc.).
   - **Target audience:** 18+ (or 13+). Avoid choosing children's age groups.
   - **Data safety:** see the answers below.
   - **Account deletion URL:** `https://mregan.xyz/garden/delete-account`
3. **Store listing:** short + full description, app icon (512×512 PNG), feature
   graphic (1024×500), and at least 2 phone screenshots.
4. **Testing → Closed testing:** create a track, upload the `.aab`, add testers'
   emails, and send them the opt-in link. Check the Dashboard for any testing
   requirements before production access is available.

### Data safety answers (matching what the code does today)

- **Collects data:** Yes. **Shares data:** No (Supabase/Mapbox/Open-Meteo act as
  service providers, which Google doesn't count as "sharing").
- **Encrypted in transit:** Yes. **Users can request deletion:** Yes.
- Data types:
  - **Personal info → Email address:** collected, required, for account management.
  - **Location → Approximate / Precise location:** used to center the map and, when there
    are no plants, sent to the weather service for a forecast. Plant coordinates the user
    places are stored. Mark it as collected for app functionality. It is optional
    (the app works without the permission).
  - **App activity → Other user-generated content:** garden plants, journal entries, and
    reminders, collected for app functionality.
- No ads, analytics, or crash reporting SDKs are in the app.

Recheck these answers whenever you add an SDK or a new kind of data.

## Notes

- The Play app and the GitHub-release APK share a package name but are signed with
  different keys, so one can't update the other. Uninstall the APK before installing
  from Play.
- Later Play releases: rerun the step 3 command, then upload the new `.aab`.
