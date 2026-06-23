import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_REMINDER_INTERVAL_DAYS,
  upsertReminderSchema,
  type GardenReminder,
  type GardenReminderWithPlant,
  type ReminderType,
  type UpsertReminderInput,
} from '../types/garden';

type ReminderRow = GardenReminder & {
  garden_placements: { name: string } | { name: string }[] | null;
};

function mapReminderRow(row: ReminderRow): GardenReminderWithPlant {
  const placement = row.garden_placements;
  const placementName = Array.isArray(placement)
    ? (placement[0]?.name ?? 'Unknown plant')
    : (placement?.name ?? 'Unknown plant');

  const { garden_placements: _, ...reminder } = row;
  return { ...reminder, placement_name: placementName };
}

export async function listReminders(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: GardenReminderWithPlant[]; error: string | null }> {
  const { data, error } = await supabase
    .from('garden_reminders')
    .select('*, garden_placements(name)')
    .eq('user_id', userId)
    .order('next_due_at', { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []).map(mapReminderRow), error: null };
}

export async function listRemindersForPlacement(
  supabase: SupabaseClient,
  placementId: string
): Promise<{ data: GardenReminder[]; error: string | null }> {
  const { data, error } = await supabase
    .from('garden_reminders')
    .select('*')
    .eq('placement_id', placementId)
    .order('reminder_type');

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as GardenReminder[], error: null };
}

export async function upsertReminder(
  supabase: SupabaseClient,
  userId: string,
  placementId: string,
  input: UpsertReminderInput
): Promise<{ data: GardenReminder | null; error: string | null }> {
  const parsed = upsertReminderSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('garden_reminders')
    .upsert(
      {
        user_id: userId,
        placement_id: placementId,
        reminder_type: parsed.data.reminder_type,
        interval_days: parsed.data.interval_days,
        next_due_at: parsed.data.next_due_at,
        enabled: parsed.data.enabled ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'placement_id,reminder_type' }
    )
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as GardenReminder, error: null };
}

export async function deleteReminder(
  supabase: SupabaseClient,
  reminderId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('garden_reminders').delete().eq('id', reminderId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function markReminderDone(
  supabase: SupabaseClient,
  reminderId: string
): Promise<{ data: GardenReminder | null; error: string | null }> {
  const { data: existing, error: fetchError } = await supabase
    .from('garden_reminders')
    .select('*')
    .eq('id', reminderId)
    .single();

  if (fetchError || !existing) {
    return { data: null, error: fetchError?.message ?? 'Reminder not found' };
  }

  const reminder = existing as GardenReminder;
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + reminder.interval_days);

  const { data, error } = await supabase
    .from('garden_reminders')
    .update({ next_due_at: nextDue.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', reminderId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as GardenReminder, error: null };
}

/** After logging journal care, push matching reminder forward if one exists. */
export async function syncReminderAfterJournalEntry(
  supabase: SupabaseClient,
  placementId: string,
  entryType: string,
  occurredAt: string
): Promise<void> {
  if (!['watered', 'fertilized', 'fungicide', 'insecticide', 'pruning'].includes(entryType)) {
    return;
  }

  const { data: existing } = await supabase
    .from('garden_reminders')
    .select('*')
    .eq('placement_id', placementId)
    .eq('reminder_type', entryType)
    .maybeSingle();

  if (!existing) {
    return;
  }

  const reminder = existing as GardenReminder;
  const base = new Date(occurredAt);
  base.setDate(base.getDate() + reminder.interval_days);

  await supabase
    .from('garden_reminders')
    .update({ next_due_at: base.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', reminder.id);
}

export function defaultNextDueAt(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString();
}

export function getDefaultIntervalDays(type: ReminderType): number {
  return DEFAULT_REMINDER_INTERVAL_DAYS[type];
}

export function formatDueStatus(nextDueAt: string): { label: string; overdue: boolean } {
  const due = new Date(nextDueAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000);

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return { label: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`, overdue: true };
  }
  if (diffDays === 0) {
    return { label: 'Due today', overdue: false };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', overdue: false };
  }
  return { label: `Due in ${diffDays} days`, overdue: false };
}
