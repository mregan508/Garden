import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider } from '@gardening/shared';
import { initNativeSupabaseClient, prepareNativeAuthSession } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    void initNativeSupabaseClient().then(setSupabase);
  }, []);

  if (!supabase) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <AuthProvider
      supabase={supabase}
      prepareAuthSession={(staySignedIn) => {
        const next = prepareNativeAuthSession(staySignedIn);
        setSupabase(next);
        return next;
      }}
    >
      {children}
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
  },
});
