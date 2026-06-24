import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  type CreateJournalEntryInput,
  type GardenJournalEntry,
  type GardenJournalEntryWithPlant,
  type UpdateJournalEntryInput,
} from '../types/garden';
import { syncReminderAfterJournalEntry } from './reminders';

export async function listJournalEntries(
  supabase: SupabaseClient,
  placementId: string
): Promise<{ data: GardenJournalEntry[]; error: string | null }> {
  const { data, error } = await supabase
    .from('garden_journal_entries')
    .select('*')
    .eq('placement_id', placementId)
    .order('occurred_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as GardenJournalEntry[], error: null };
}

export async function createJournalEntry(
  supabase: SupabaseClient,
  userId: string,
  placementId: string,
  input: CreateJournalEntryInput
): Promise<{ data: GardenJournalEntry | null; error: string | null }> {
  const parsed = createJournalEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('garden_journal_entries')
    .insert({
      user_id: userId,
      placement_id: placementId,
      entry_type: parsed.data.entry_type,
      occurred_at: parsed.data.occurred_at,
      notes: parsed.data.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const entry = data as GardenJournalEntry;
  await syncReminderAfterJournalEntry(
    supabase,
    placementId,
    entry.entry_type,
    entry.occurred_at
  );

  return { data: entry, error: null };
}

export async function updateJournalEntry(
  supabase: SupabaseClient,
  entryId: string,
  input: UpdateJournalEntryInput
): Promise<{ data: GardenJournalEntry | null; error: string | null }> {
  const parsed = updateJournalEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.occurred_at !== undefined) {
    payload.occurred_at = parsed.data.occurred_at;
  }
  if (parsed.data.notes !== undefined) {
    payload.notes = parsed.data.notes?.trim() || null;
  }

  const { data, error } = await supabase
    .from('garden_journal_entries')
    .update(payload)
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const entry = data as GardenJournalEntry;
  await syncReminderAfterJournalEntry(
    supabase,
    entry.placement_id,
    entry.entry_type,
    entry.occurred_at
  );

  return { data: entry, error: null };
}

export function findPlantedEntry(
  entries: GardenJournalEntry[]
): GardenJournalEntry | undefined {
  return entries.find((entry) => entry.entry_type === 'planted');
}

export async function deleteJournalEntry(
  supabase: SupabaseClient,
  entryId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('garden_journal_entries').delete().eq('id', entryId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

type JournalRow = GardenJournalEntry & {
  garden_placements: { name: string } | { name: string }[] | null;
};

export async function listRecentJournalEntries(
  supabase: SupabaseClient,
  userId: string,
  limit = 50
): Promise<{ data: GardenJournalEntryWithPlant[]; error: string | null }> {
  const { data, error } = await supabase
    .from('garden_journal_entries')
    .select('*, garden_placements(name)')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message };
  }

  const entries = (data ?? []).map((row: JournalRow) => {
    const placement = row.garden_placements;
    const placementName = Array.isArray(placement)
      ? (placement[0]?.name ?? 'Unknown plant')
      : (placement?.name ?? 'Unknown plant');
    const { garden_placements: _, ...entry } = row;
    return { ...entry, placement_name: placementName };
  });

  return { data: entries, error: null };
}

/** ISO timestamp for a local calendar date (YYYY-MM-DD) at noon UTC. */
export function dateInputToIso(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

export function isoToDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function formatJournalDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
