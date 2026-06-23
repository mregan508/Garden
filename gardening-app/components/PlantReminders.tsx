import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
    <View style={styles.wrap}>
      <Text style={styles.heading}>Care reminders</Text>
      <Text style={styles.hint}>Reminders reset when you log matching journal entries.</Text>

      {loading ? (
        <ActivityIndicator color="#059669" style={styles.loader} />
      ) : reminders.length === 0 ? (
        <Text style={styles.empty}>No reminders set for this plant yet.</Text>
      ) : (
        reminders.map((reminder) => {
          const status = formatDueStatus(reminder.next_due_at);
          return (
            <View key={reminder.id} style={styles.item}>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{REMINDER_TYPE_LABELS[reminder.reminder_type]}</Text>
                <Text style={[styles.itemMeta, status.overdue && styles.overdue]}>
                  Every {reminder.interval_days} days · {status.label}
                </Text>
              </View>
              <Pressable onPress={() => void handleRemove(reminder.id)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          );
        })
      )}

      {availableTypes.length > 0 ? (
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Add reminder type</Text>
          <View style={styles.typeRow}>
            {availableTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.typeChip, draftType === type && styles.typeChipSelected]}
                onPress={() => {
                  setDraftType(type);
                  setDraftInterval(String(getDefaultIntervalDays(type)));
                }}
              >
                <Text style={[styles.typeChipText, draftType === type && styles.typeChipTextSelected]}>
                  {REMINDER_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Repeat every (days)</Text>
          <TextInput
            style={styles.input}
            value={draftInterval}
            onChangeText={setDraftInterval}
            keyboardType="number-pad"
          />
          <Pressable
            style={[styles.addButton, saving && styles.buttonDisabled]}
            onPress={() => void handleAdd()}
            disabled={saving}
          >
            <Text style={styles.addButtonText}>{saving ? 'Saving...' : 'Add reminder'}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.empty}>All reminder types configured.</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1fae5', paddingTop: 12 },
  heading: { fontSize: 15, fontWeight: '600', color: '#064e3b', marginBottom: 4 },
  hint: { fontSize: 11, color: '#6b7280', marginBottom: 8 },
  loader: { marginTop: 8 },
  empty: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemBody: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
  itemMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  overdue: { color: '#dc2626', fontWeight: '600' },
  remove: { fontSize: 11, color: '#dc2626' },
  form: { marginTop: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#374151', marginTop: 8, marginBottom: 4 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  typeChipSelected: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  typeChipText: { fontSize: 11, color: '#374151' },
  typeChipTextSelected: { color: '#047857', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
  error: { color: '#dc2626', fontSize: 12, marginTop: 4 },
});
