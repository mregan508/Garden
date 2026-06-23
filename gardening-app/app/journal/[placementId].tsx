import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getPlacement, useAuth } from '@gardening/shared';
import { PlantJournal } from '@/components/PlantJournal';

export default function PlantJournalScreen() {
  const router = useRouter();
  const { placementId } = useLocalSearchParams<{ placementId: string }>();
  const { user, supabase } = useAuth();
  const [placementName, setPlacementName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !placementId) return;

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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back to garden</Text>
          </Pressable>
          <Text style={styles.title}>
            {loading ? 'Loading...' : placementName ? `${placementName} journal` : 'Plant journal'}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : loading || !user || !supabase || !placementId || !placementName ? (
            <ActivityIndicator color="#059669" style={styles.loader} />
          ) : (
            <PlantJournal
              supabase={supabase}
              userId={user.id}
              placementId={placementId}
              placementName={placementName}
              fullPage
            />
          )}
        </ScrollView>
      </View>
    </>
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
  backLink: { fontSize: 14, color: '#047857', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#064e3b' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loader: { marginTop: 24 },
  error: { color: '#dc2626', fontSize: 14 },
});
