'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  JOURNAL_ENTRY_LABELS,
  formatJournalDate,
  listRecentJournalEntries,
  useAuth,
  type GardenJournalEntryWithPlant,
} from '@gardening/shared';

export function ActivityPage() {
  const { user, supabase } = useAuth();
  const [entries, setEntries] = useState<GardenJournalEntryWithPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;

    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: listError } = await listRecentJournalEntries(supabase, user.id, 50);
      if (listError) {
        setError(listError);
      } else {
        setEntries(data);
      }
      setLoading(false);
    })();
  }, [user, supabase]);

  return (
    <div className="flex min-h-screen flex-col bg-emerald-50">
      <header className="border-b border-emerald-100 bg-white px-4 py-4">
        <Link href="/" className="mb-2 inline-block text-sm text-emerald-700 hover:underline">
          ← Back to garden
        </Link>
        <h1 className="text-xl font-semibold text-emerald-900">Garden activity</h1>
        <p className="text-sm text-emerald-700">Recent journal entries across all plants</p>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading activity...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-500">
            No journal entries yet. Log care from a plant&apos;s journal page.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/${entry.placement_id}/journal`}
                      className="text-sm font-semibold text-emerald-800 hover:underline"
                    >
                      {entry.placement_name}
                    </Link>
                    <p className="text-sm font-medium text-gray-900">
                      {JOURNAL_ENTRY_LABELS[entry.entry_type]}
                    </p>
                    <p className="text-xs text-gray-500">{formatJournalDate(entry.occurred_at)}</p>
                    {entry.notes ? (
                      <p className="mt-1 text-xs text-gray-700">{entry.notes}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
