import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Delete your account · Garden Map',
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-10 text-gray-900">
      <article className="mx-auto max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-emerald-900">Delete your Garden Map account</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">In the Android app</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Open Garden Map and sign in.</li>
            <li>
              On the <strong>Garden</strong> tab, tap <strong>Delete account</strong> (top right,
              under Sign out).
            </li>
            <li>Confirm by tapping <strong>Delete</strong>.</li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">On the web</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <Link href="/login" className="text-emerald-700 underline">
                Sign in
              </Link>{' '}
              at mregan.xyz/garden.
            </li>
            <li>
              In the sidebar, click <strong>Delete account</strong> (under Sign out) and confirm.
            </li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-emerald-900">What gets deleted</h2>
          <p>
            Deletion is immediate and permanent. It removes your account (email and password) and
            all of your garden data: plants and their map locations, journal entries, and
            reminders. No account data is kept after deletion.
          </p>
        </section>

        <p className="text-sm text-gray-600">
          See also the{' '}
          <Link href="/privacy" className="text-emerald-700 underline">
            privacy policy
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
