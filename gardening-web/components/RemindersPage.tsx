'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  REMINDER_TYPE_LABELS,
  formatDueStatus,
  listReminders,
  markReminderDone,
  useAuth,
  type GardenReminderWithPlant,
} from '@gardening/shared';

export function RemindersPage() {
  const { user, supabase } = useAuth();
  const [reminders, setReminders] = useState<GardenReminderWithPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: listError } = await listReminders(supabase, user.id);
      if (listError) {
        setError(listError);
      } else {
        setReminders(data.filter((r) => r.enabled));
      }
      setLoading(false);
    })();
  }, [supabase, user]);

  const { overdue, upcoming } = useMemo(() => {
    const now = new Date();
    const overdueList: GardenReminderWithPlant[] = [];
    const upcomingList: GardenReminderWithPlant[] = [];

    for (const reminder of reminders) {
      const due = new Date(reminder.next_due_at);
      if (due <= now || formatDueStatus(reminder.next_due_at).overdue) {
        overdueList.push(reminder);
      } else {
        upcomingList.push(reminder);
      }
    }

    return { overdue: overdueList, upcoming: upcomingList };
  }, [reminders]);

  const handleMarkDone = async (reminderId: string) => {
    setCompletingId(reminderId);
    setError(null);
    const { data, error: doneError } = await markReminderDone(supabase, reminderId);
    setCompletingId(null);
    if (doneError) {
      setError(doneError);
      return;
    }
    if (data) {
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, ...data } : r))
      );
    }
  };

  const renderReminder = (reminder: GardenReminderWithPlant) => {
    const status = formatDueStatus(reminder.next_due_at);
    return (
      <li
        key={reminder.id}
        className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm"
      >
        <div className="min-w-0 flex-1">
          <Link
            href={`/${reminder.placement_id}/journal`}
            className="text-sm font-semibold text-emerald-800 hover:underline"
          >
            {reminder.placement_name}
          </Link>
          <p className="text-sm font-medium text-gray-900">
            {REMINDER_TYPE_LABELS[reminder.reminder_type]}
          </p>
          <p className={`text-xs ${status.overdue ? 'font-medium text-red-600' : 'text-gray-500'}`}>
            Every {reminder.interval_days} days · {status.label}
          </p>
        </div>
        <button
          type="button"
          disabled={completingId === reminder.id}
          onClick={() => void handleMarkDone(reminder.id)}
          className="shrink-0 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          {completingId === reminder.id ? 'Saving...' : 'Mark done'}
        </button>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-emerald-50">
      <header className="border-b border-emerald-100 bg-white px-4 py-4">
        <Link href="/" className="mb-2 inline-block text-sm text-emerald-700 hover:underline">
          ← Back to garden
        </Link>
        <h1 className="text-xl font-semibold text-emerald-900">Care reminders</h1>
        <p className="text-sm text-emerald-700">Upcoming and overdue tasks across your garden</p>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading reminders...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : reminders.length === 0 ? (
          <p className="text-sm text-gray-500">
            No reminders yet. Add them from a plant&apos;s journal page.
          </p>
        ) : (
          <>
            {overdue.length > 0 ? (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-red-700">Overdue</h2>
                <ul className="space-y-2">{overdue.map(renderReminder)}</ul>
              </section>
            ) : null}
            {upcoming.length > 0 ? (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-emerald-800">Upcoming</h2>
                <ul className="space-y-2">{upcoming.map(renderReminder)}</ul>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
