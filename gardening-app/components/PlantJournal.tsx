import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  JOURNAL_ENTRY_LABELS,
  JOURNAL_ENTRY_TYPES,
  createJournalEntry,
  dateInputToIso,
  deleteJournalEntry,
  formatJournalDate,
  isoToDateInput,
  listJournalEntries,
  type GardenJournalEntry,
  type JournalEntryType,
} from '@gardening/shared';

interface PlantJournalProps {
  supabase: SupabaseClient;
  userId: string;
  placementId: string;
  placementName?: string;
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
  const [expanded, setExpanded] = useState(fullPage);

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
    const { error: deleteError } = await deleteJournalEntry(supabase, entryId);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  return (
    <View style={fullPage ? styles.wrapPage : styles.wrap}>
      {fullPage ? (
        placementName ? (
          <Text style={styles.headingPage}>{placementName}</Text>
        ) : null
      ) : (
        <Pressable onPress={() => setExpanded((e) => !e)}>
          <Text style={styles.heading}>
            Journal ({entries.length}) {expanded ? '▾' : '▸'}
          </Text>
        </Pressable>
      )}

      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.fieldLabel}>Event type</Text>
          <View style={styles.typeRow}>
            {JOURNAL_ENTRY_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[styles.typeChip, entryType === type && styles.typeChipSelected]}
                onPress={() => setEntryType(type)}
              >
                <Text
                  style={[styles.typeChipText, entryType === type && styles.typeChipTextSelected]}
                >
                  {JOURNAL_ENTRY_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={occurredOn}
            onChangeText={setOccurredOn}
            placeholder="2026-06-23"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Details, product, amount..."
            placeholderTextColor="#6b7280"
            multiline
          />

          <Pressable
            style={[styles.addButton, saving && styles.buttonDisabled]}
            onPress={() => void handleAdd()}
            disabled={saving || !occurredOn}
          >
            <Text style={styles.addButtonText}>{saving ? 'Adding...' : 'Add entry'}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color="#059669" style={styles.loader} />
          ) : entries.length === 0 ? (
            <Text style={styles.empty}>No entries yet.</Text>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <View style={styles.entryBody}>
                  <Text style={styles.entryTitle}>{JOURNAL_ENTRY_LABELS[entry.entry_type]}</Text>
                  <Text style={styles.entryDate}>{formatJournalDate(entry.occurred_at)}</Text>
                  {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
                </View>
                <Pressable onPress={() => void handleDelete(entry.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1fae5', paddingTop: 12 },
  wrapPage: { flex: 1 },
  heading: { fontSize: 15, fontWeight: '600', color: '#064e3b', marginBottom: 8 },
  headingPage: { fontSize: 18, fontWeight: '600', color: '#064e3b', marginBottom: 12 },
  body: { gap: 4 },
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
  notesInput: { minHeight: 56, textAlignVertical: 'top' },
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
  loader: { marginTop: 8 },
  empty: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  entryBody: { flex: 1, marginRight: 8 },
  entryTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
  entryDate: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  entryNotes: { fontSize: 12, color: '#374151', marginTop: 4 },
  remove: { fontSize: 11, color: '#dc2626' },
});
