import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  JOURNAL_ENTRY_LABELS,
  REMINDER_TYPE_LABELS,
  formatDueStatus,
  formatJournalDate,
  listRecentJournalEntries,
  listReminders,
  markReminderDone,
  useAuth,
  type GardenJournalEntryWithPlant,
  type GardenReminderWithPlant,
} from '@gardening/shared';

export default function ActivityScreen() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [entries, setEntries] = useState<GardenJournalEntryWithPlant[]>([]);
  const [reminders, setReminders] = useState<GardenReminderWithPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const [journalResult, remindersResult] = await Promise.all([
      listRecentJournalEntries(supabase, user.id, 30),
      listReminders(supabase, user.id),
    ]);
    if (journalResult.error) {
      setError(journalResult.error);
    } else {
      setEntries(journalResult.data);
    }
    if (remindersResult.error) {
      setError(remindersResult.error);
    } else {
      setReminders(remindersResult.data.filter((r) => r.enabled));
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sortedReminders = useMemo(
    () => [...reminders].sort((a, b) => a.next_due_at.localeCompare(b.next_due_at)),
    [reminders]
  );

  const handleMarkDone = async (reminderId: string) => {
    setCompletingId(reminderId);
    const { data, error: doneError } = await markReminderDone(supabase, reminderId);
    setCompletingId(null);
    if (doneError) {
      setError(doneError);
      return;
    }
    if (data) {
      setReminders((prev) => prev.map((r) => (r.id === reminderId ? { ...r, ...data } : r)));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Reminders and recent journal entries</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color="#059669" style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Care reminders</Text>
            {sortedReminders.length === 0 ? (
              <Text style={styles.empty}>No reminders yet. Add them from a plant journal.</Text>
            ) : (
              sortedReminders.map((reminder) => {
                const status = formatDueStatus(reminder.next_due_at);
                return (
                  <View key={reminder.id} style={styles.card}>
                    <Pressable onPress={() => router.push(`/journal/${reminder.placement_id}`)}>
                      <Text style={styles.plantName}>{reminder.placement_name}</Text>
                    </Pressable>
                    <Text style={styles.cardTitle}>{REMINDER_TYPE_LABELS[reminder.reminder_type]}</Text>
                    <Text style={[styles.cardMeta, status.overdue && styles.overdue]}>
                      Every {reminder.interval_days} days · {status.label}
                    </Text>
                    <Pressable
                      style={[styles.doneButton, completingId === reminder.id && styles.buttonDisabled]}
                      onPress={() => void handleMarkDone(reminder.id)}
                      disabled={completingId === reminder.id}
                    >
                      <Text style={styles.doneButtonText}>
                        {completingId === reminder.id ? 'Saving...' : 'Mark done'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Recent activity</Text>
            {entries.length === 0 ? (
              <Text style={styles.empty}>No journal entries yet.</Text>
            ) : (
              entries.map((entry) => (
                <Pressable
                  key={entry.id}
                  style={styles.card}
                  onPress={() => router.push(`/journal/${entry.placement_id}`)}
                >
                  <Text style={styles.plantName}>{entry.placement_name}</Text>
                  <Text style={styles.cardTitle}>{JOURNAL_ENTRY_LABELS[entry.entry_type]}</Text>
                  <Text style={styles.cardMeta}>{formatJournalDate(entry.occurred_at)}</Text>
                  {entry.notes ? <Text style={styles.notes}>{entry.notes}</Text> : null}
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  title: { fontSize: 22, fontWeight: '600', color: '#064e3b' },
  subtitle: { fontSize: 13, color: '#047857', marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loader: { marginTop: 24 },
  error: { color: '#dc2626', fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#064e3b', marginBottom: 8 },
  sectionGap: { marginTop: 20 },
  empty: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  plantName: { fontSize: 13, fontWeight: '600', color: '#047857' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  overdue: { color: '#dc2626', fontWeight: '600' },
  notes: { fontSize: 12, color: '#374151', marginTop: 4 },
  doneButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ecfdf5',
  },
  doneButtonText: { fontSize: 12, fontWeight: '600', color: '#047857' },
  buttonDisabled: { opacity: 0.5 },
});
