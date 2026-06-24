import { createNativeSupabaseClient } from '@gardening/shared/supabase/client-native';
import { readStaySignedInPreference, STAY_SIGNED_IN_PREF_KEY } from '@gardening/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

let client: ReturnType<typeof createNativeSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createNativeSupabaseClient({ staySignedIn: true });
  }
  return client;
}

export async function loadNativeStaySignedInPreference(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(STAY_SIGNED_IN_PREF_KEY);
  return readStaySignedInPreference(stored);
}

export function prepareNativeAuthSession(staySignedIn: boolean) {
  void AsyncStorage.setItem(STAY_SIGNED_IN_PREF_KEY, String(staySignedIn));
  client = createNativeSupabaseClient({ staySignedIn });
  return client;
}

export { isNativeSupabaseConfigured } from '@gardening/shared/supabase/client-native';
