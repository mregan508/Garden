'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  JOURNAL_ENTRY_LABELS,
  JOURNAL_ENTRY_TYPES,
  createJournalEntry,
  dateInputToIso,
  deleteJournalEntry,
  findPlantedEntry,
  formatJournalDate,
  isoToDateInput,
  listJournalEntries,
  updateJournalEntry,
  type GardenJournalEntry,
  type JournalEntryType,
} from '@gardening/shared';

interface PlantJournalProps {
  supabase: SupabaseClient;
  userId: string;
  placementId: string;
  placementName: string;
  fullPage?: boolean;
}

export function PlantJournal({
  supabase,
  userId,
  placementId,
  placementName,
  fullPage = false,
}: PlantJournalProps) {
  const [entries, setEntries] = useState<GardenJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<JournalEntryType>('watered');
  const [occurredOn, setOccurredOn] = useState(() => isoToDateInput(new Date().toISOString()));
  const [notes, setNotes] = useState('');
  const [plantedOn, setPlantedOn] = useState(() => isoToDateInput(new Date().toISOString()));
  const [savingPlantedOn, setSavingPlantedOn] = useState(false);

  const plantedEntry = findPlantedEntry(entries);
  const timelineEntries = entries.filter((entry) => entry.entry_type !== 'planted');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: listError } = await listJournalEntries(supabase, placementId);
    if (listError) {
      setError(listError);
    } else {
      setEntries(data);
    }
    setLoading(false);
  }, [supabase, placementId]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (plantedEntry) {
      setPlantedOn(isoToDateInput(plantedEntry.occurred_at));
    }
  }, [plantedEntry]);

  const handleSavePlantedOn = async () => {
    if (!plantedOn) return;
    setSavingPlantedOn(true);
    setError(null);
    const occurred_at = dateInputToIso(plantedOn);

    if (plantedEntry) {
      const { data, error: updateError } = await updateJournalEntry(supabase, plantedEntry.id, {
        occurred_at,
      });
      setSavingPlantedOn(false);
      if (updateError) {
        setError(updateError);
        return;
      }
      if (data) {
        setEntries((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      }
      return;
    }

    const { data, error: createError } = await createJournalEntry(supabase, userId, placementId, {
      entry_type: 'planted',
      occurred_at,
      notes: null,
    });
    setSavingPlantedOn(false);
    if (createError) {
      setError(createError);
      return;
    }
    if (data) {
      setEntries((prev) => [data, ...prev]);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    setError(null);
    const { data, error: createError } = await createJournalEntry(supabase, userId, placementId, {
      entry_type: entryType,
      occurred_at: dateInputToIso(occurredOn),
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (createError) {
      setError(createError);
      return;
    }
    if (data) {
      setEntries((prev) => [data, ...prev]);
      setNotes('');
      setEntryType('watered');
      setOccurredOn(isoToDateInput(new Date().toISOString()));
    }
  };

  const handleDelete = async (entryId: string) => {
    setError(null);
    const { error: deleteError } = await deleteJournalEntry(supabase, entryId);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  return (
    <div className={fullPage ? 'flex flex-col' : 'mt-4 border-t border-emerald-100 pt-4'}>
      <h3
        className={`mb-3 font-semibold text-emerald-900 ${fullPage ? 'text-lg' : 'text-sm'}`}
      >
        Journal — {placementName}
      </h3>

      <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
        <label htmlFor="planted-on" className="block text-xs font-medium text-gray-700">
          Planted on
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="planted-on"
            type="date"
            value={plantedOn}
            onChange={(e) => setPlantedOn(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
          <button
            type="button"
            disabled={savingPlantedOn || !plantedOn}
            onClick={() => void handleSavePlantedOn()}
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {savingPlantedOn ? 'Saving...' : 'Save'}
          </button>
        </div>
        {plantedEntry ? (
          <p className="mt-1 text-xs text-gray-500">
            Currently recorded as {formatJournalDate(plantedEntry.occurred_at)}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">No planted date yet — set one above.</p>
        )}
      </div>

      <div className="mb-3 space-y-2">
        <label htmlFor="journal-type" className="block text-xs font-medium text-gray-700">
          Event
        </label>
        <select
          id="journal-type"
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as JournalEntryType)}
          className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        >
          {JOURNAL_ENTRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {JOURNAL_ENTRY_LABELS[type]}
            </option>
          ))}
        </select>

        <label htmlFor="journal-date" className="block text-xs font-medium text-gray-700">
          Date
        </label>
        <input
          id="journal-date"
          type="date"
          value={occurredOn}
          onChange={(e) => setOccurredOn(e.target.value)}
          className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />

        <label htmlFor="journal-notes" className="block text-xs font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          id="journal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Details, product used, amount..."
          className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />

        <button
          type="button"
          disabled={saving || !occurredOn}
          onClick={() => void handleAdd()}
          className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add journal entry'}
        </button>
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {loading ? (
        <p className="text-xs text-gray-500">Loading journal...</p>
      ) : timelineEntries.length === 0 ? (
        <p className="text-xs text-gray-500">No entries yet. Log watering, fertilizing, and growth milestones.</p>
      ) : (
        <ul
          className={
            fullPage ? 'space-y-2' : 'max-h-48 space-y-2 overflow-y-auto'
          }
        >
          {timelineEntries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {JOURNAL_ENTRY_LABELS[entry.entry_type]}
                </p>
                <p className="text-xs text-gray-500">{formatJournalDate(entry.occurred_at)}</p>
                {entry.notes && (
                  <p className="mt-1 text-xs text-gray-700">{entry.notes}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(entry.id)}
                className="shrink-0 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
