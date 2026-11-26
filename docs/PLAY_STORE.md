# Publishing Garden Map on Google Play

What the repo already handles, and the steps only the owner can do (accounts,
keys, store listing). Google changes Play Console requirements from time to time.
If a step here doesn't match what the Console shows, follow the Console.

## Already done in the repo

| Play requirement | Where |
|---|---|
| Permanent package name `xyz.mregan.gardenmap` | `gardening-app/app.json` → `android.package` (**never change it after the first upload**) |
| Increasing `versionCode` on every upload | CI passes `github.run_number` via `ANDROID_VERSION_CODE` (`gardening-app/app.config.js`) |
| App bundle (`.aab`) format | CI artifact **garden-map-aab** (`.github/workflows/build-android-apk.yml`) |
| Same signing key on every upload | CI reads the upload key from repo secrets (below) |
| Privacy policy URL | https://mregan.xyz/garden/privacy |
| In-app account deletion | "Delete account" under Sign out (mobile + web), backed by `delete_my_account()` in Supabase |
| Account-deletion web URL | https://mregan.xyz/garden/delete-account |

## 1. Apply the database migration

`supabase/migrations/20261126120000_add_delete_my_account.sql` must be applied to the
hosted project, or "Delete account" will fail. Apply it the same way as earlier migrations.

## 2. Create a Google Play developer account

https://play.google.com/console/signup: pick a **personal** account. There's a one-time
registration fee, and Google verifies your identity.

New personal accounts must run a **closed test** with a minimum number of testers who
stay opted in for a minimum number of days before production is unlocked. The Console
shows the current numbers. Line up friends/family with Android phones and Google accounts.

## 3. Create the upload key (one time, on your computer)

Needs Java's `keytool` (comes with Android Studio or any JDK):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore garden-upload.keystore -alias gardenmap-upload -keyalg RSA -keysize 2048 -validity 10000
```

Pick a strong password and **back up the keystore file and password** somewhere safe
(a password manager). With Play App Signing (the default), Google holds the real
signing key. If you lose this upload key, Google support can reset it, but it's a hassle.

Then base64-encode it so it fits in a GitHub secret:

```bash
base64 -w0 garden-upload.keystore > garden-upload.keystore.b64
```

(macOS: `base64 -i garden-upload.keystore -o garden-upload.keystore.b64`)

## 4. Add GitHub repository secrets

GitHub → repo **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `ANDROID_UPLOAD_KEYSTORE_BASE64` | contents of `garden-upload.keystore.b64` |
| `ANDROID_UPLOAD_KEYSTORE_PASSWORD` | the keystore password |
| `ANDROID_UPLOAD_KEY_ALIAS` | `gardenmap-upload` |
| `ANDROID_UPLOAD_KEY_PASSWORD` | the key password (same as keystore password if you didn't set a separate one) |

Without these, CI still builds but signs with a throwaway key and logs a warning.
That `.aab` will be rejected by Play.

## 5. Build

Actions → **Build Android APK** → Run workflow (or push to `main`). Download the
**garden-map-aab** artifact (it's a zip containing `garden-map.aab`).

## 6. Create the app in Play Console

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
4. **Testing → Closed testing:** create a track, upload `garden-map.aab`, add testers'
   emails, and send them the opt-in link. When the tester requirement is met,
   apply for production access from the Dashboard.

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

- Changing the package name means the Play app installs **alongside** old sideloaded
  APKs instead of replacing them. Testers should uninstall the old "Garden Map" APK.
- Each push to `main` still publishes the sideload APK to GitHub Releases. Uploading
  to Play stays a manual step (download the AAB and upload it in the Console). It can
  be automated later with a Play service account, after the first manual upload.
