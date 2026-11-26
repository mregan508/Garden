import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy · Garden Map',
};

const LAST_UPDATED = 'November 26, 2026';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-10 text-gray-900">
      <article className="mx-auto max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <header>
          <h1 className="text-2xl font-semibold text-emerald-900">Garden Map Privacy Policy</h1>
          <p className="mt-1 text-sm text-gray-600">Last updated {LAST_UPDATED}</p>
        </header>

        <p>
          Garden Map is a personal garden planning app available on the web at mregan.xyz/garden
          and as an Android app. This policy explains what data the app handles and why.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">Data we store</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Account details:</strong> your email address and a password (stored hashed by
              our authentication provider), used only to sign you in.
            </li>
            <li>
              <strong>Garden data you enter:</strong> plants you place on the map (name, variety,
              and the map coordinates where you put them), journal entries, and reminders.
            </li>
          </ul>
          <p>
            This data is private to your account. It is not sold, shared for advertising, or used
            to track you. The app contains no ads and no third-party analytics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">Device location</h2>
          <p>
            If you grant location permission, the app reads your current location only to center
            the map on where you are. Your device location is not saved to your account. Only the
            plant locations you choose to save are stored.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">Services that process data</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> hosts the account and garden database.
            </li>
            <li>
              <strong>Mapbox</strong> provides satellite map imagery and address search. Map views
              and any address you search for are sent to Mapbox to show the map and results.
            </li>
            <li>
              <strong>Open-Meteo</strong> provides weather forecasts. The approximate coordinates of
              your garden (or of the map center, if you have not placed plants yet) are sent to
              Open-Meteo to fetch the forecast.
            </li>
            <li>
              <strong>Vercel</strong> hosts the website.
            </li>
          </ul>
          <p>Data is sent to these services over encrypted (HTTPS) connections.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">Deleting your data</h2>
          <p>
            You can permanently delete your account and all associated garden data at any time
            from within the app (<em>Delete account</em>, under Sign out). See{' '}
            <Link href="/delete-account" className="text-emerald-700 underline">
              how to delete your account
            </Link>{' '}
            for step-by-step instructions. Deletion is immediate and cannot be undone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">Children</h2>
          <p>Garden Map is not directed at children under 13.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">Changes and contact</h2>
          <p>
            If this policy changes, the updated version will be posted on this page with a new
            date. For questions, use the developer contact email shown on the Garden Map Google
            Play listing.
          </p>
        </section>
      </article>
    </main>
  );
}
