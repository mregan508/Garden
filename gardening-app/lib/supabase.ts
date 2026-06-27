import { createNativeSupabaseClient } from '@gardening/shared/supabase/client-native';
import { readStaySignedInPreference, STAY_SIGNED_IN_PREF_KEY } from '@gardening/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

let client: ReturnType<typeof createNativeSupabaseClient> | null = null;
let currentStaySignedIn: boolean | null = null;

export function getSupabaseClient() {
  if (!client) {
    const staySignedIn = currentStaySignedIn ?? true;
    client = createNativeSupabaseClient({ staySignedIn });
    currentStaySignedIn = staySignedIn;
  }
  return client;
}

export async function loadNativeStaySignedInPreference(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(STAY_SIGNED_IN_PREF_KEY);
  return readStaySignedInPreference(stored);
}

/** Create the Supabase client using the saved stay-signed-in preference (call once on app start). */
export async function initNativeSupabaseClient(): Promise<
  ReturnType<typeof createNativeSupabaseClient>
> {
  const staySignedIn = await loadNativeStaySignedInPreference();
  return prepareNativeAuthSession(staySignedIn);
}

export function prepareNativeAuthSession(staySignedIn: boolean) {
  void AsyncStorage.setItem(STAY_SIGNED_IN_PREF_KEY, String(staySignedIn));
  if (client && currentStaySignedIn === staySignedIn) {
    return client;
  }
  currentStaySignedIn = staySignedIn;
  client = createNativeSupabaseClient({ staySignedIn });
  return client;
}

export { isNativeSupabaseConfigured } from '@gardening/shared/supabase/client-native';
