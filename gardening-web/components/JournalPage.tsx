'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPlacement, useAuth } from '@gardening/shared';
import { PlantJournal } from '@/components/PlantJournal';
import { PlantReminders } from '@/components/PlantReminders';

interface JournalPageProps {
  placementId: string;
}

export function JournalPage({ placementId }: JournalPageProps) {
  const { user, supabase } = useAuth();
  const [placementName, setPlacementName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: loadError } = await getPlacement(supabase, placementId);
      if (loadError || !data) {
        setError(loadError ?? 'Plant not found');
        setPlacementName(null);
      } else {
        setPlacementName(data.name);
      }
      setLoading(false);
    })();
  }, [supabase, placementId]);

  return (
    <div className="flex min-h-screen flex-col bg-emerald-50">
      <header className="border-b border-emerald-100 bg-white px-4 py-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm text-emerald-700 hover:underline"
        >
          ← Back to garden
        </Link>
        <h1 className="text-xl font-semibold text-emerald-900">
          {loading ? 'Loading...' : placementName ? `${placementName} journal` : 'Plant journal'}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 p-4">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : loading || !user || !supabase || !placementName ? (
          <p className="text-sm text-gray-500">Loading journal...</p>
        ) : (
          <>
            <PlantJournal
              supabase={supabase}
              userId={user.id}
              placementId={placementId}
              placementName={placementName}
              fullPage
            />
            <PlantReminders supabase={supabase} userId={user.id} placementId={placementId} />
          </>
        )}
      </main>
    </div>
  );
}
