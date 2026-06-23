'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  REMINDER_TYPES,
  REMINDER_TYPE_LABELS,
  defaultNextDueAt,
  deleteReminder,
  formatDueStatus,
  getDefaultIntervalDays,
  listRemindersForPlacement,
  upsertReminder,
  type GardenReminder,
  type ReminderType,
} from '@gardening/shared';

interface PlantRemindersProps {
  supabase: SupabaseClient;
  userId: string;
  placementId: string;
}

export function PlantReminders({ supabase, userId, placementId }: PlantRemindersProps) {
  const [reminders, setReminders] = useState<GardenReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<ReminderType>('watered');
  const [draftInterval, setDraftInterval] = useState(String(getDefaultIntervalDays('watered')));

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: listError } = await listRemindersForPlacement(supabase, placementId);
    if (listError) {
      setError(listError);
    } else {
      setReminders(data);
    }
    setLoading(false);
  }, [supabase, placementId]);

  useEffect(() => {
    void loadReminders();
  }, [loadReminders]);

  const handleAdd = async () => {
    const intervalDays = Number.parseInt(draftInterval, 10);
    if (!Number.isFinite(intervalDays) || intervalDays < 1) {
      setError('Interval must be at least 1 day');
      return;
    }

    setSaving(true);
    setError(null);
    const { data, error: upsertError } = await upsertReminder(supabase, userId, placementId, {
      reminder_type: draftType,
      interval_days: intervalDays,
      next_due_at: defaultNextDueAt(intervalDays),
      enabled: true,
    });
    setSaving(false);

    if (upsertError) {
      setError(upsertError);
      return;
    }
    if (data) {
      setReminders((prev) => {
        const without = prev.filter((r) => r.reminder_type !== data.reminder_type);
        return [...without, data].sort((a, b) => a.reminder_type.localeCompare(b.reminder_type));
      });
    }
  };

  const handleRemove = async (reminderId: string) => {
    setError(null);
    const { error: deleteError } = await deleteReminder(supabase, reminderId);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const configuredTypes = new Set(reminders.map((r) => r.reminder_type));
  const availableTypes = REMINDER_TYPES.filter((t) => !configuredTypes.has(t));

  return (
    <div className="mt-6 border-t border-emerald-100 pt-4">
      <h3 className="mb-3 text-sm font-semibold text-emerald-900">Care reminders</h3>
      <p className="mb-3 text-xs text-gray-600">
        Reminders reset when you log matching journal entries.
      </p>

      {loading ? (
        <p className="text-xs text-gray-500">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="mb-3 text-xs text-gray-500">No reminders set for this plant yet.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {reminders.map((reminder) => {
            const status = formatDueStatus(reminder.next_due_at);
            return (
              <li
                key={reminder.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {REMINDER_TYPE_LABELS[reminder.reminder_type]}
                  </p>
                  <p className={`text-xs ${status.overdue ? 'text-red-600' : 'text-gray-500'}`}>
                    Every {reminder.interval_days} days · {status.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(reminder.id)}
                  className="shrink-0 text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {availableTypes.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="reminder-type" className="block text-xs font-medium text-gray-700">
            Add reminder
          </label>
          <select
            id="reminder-type"
            value={draftType}
            onChange={(e) => {
              const type = e.target.value as ReminderType;
              setDraftType(type);
              setDraftInterval(String(getDefaultIntervalDays(type)));
            }}
            className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900"
          >
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {REMINDER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <label htmlFor="reminder-interval" className="block text-xs font-medium text-gray-700">
            Repeat every (days)
          </label>
          <input
            id="reminder-interval"
            type="number"
            min={1}
            max={365}
            value={draftInterval}
            onChange={(e) => setDraftInterval(e.target.value)}
            className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleAdd()}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add reminder'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500">All reminder types are configured for this plant.</p>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
