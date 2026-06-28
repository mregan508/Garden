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

/** Create the Supabase client using the saved stay-signed-in preference (call once on app start). */
export async function initNativeSupabaseClient(): Promise<
  ReturnType<typeof createNativeSupabaseClient>
> {
  const staySignedIn = await loadNativeStaySignedInPreference();
  void AsyncStorage.setItem(STAY_SIGNED_IN_PREF_KEY, String(staySignedIn));

  const supabase = getSupabaseClient();

  // When "stay signed in" is off, do not restore a persisted session on app launch.
  if (!staySignedIn) {
    await supabase.auth.signOut();
  }

  return supabase;
}

/** Update stay-signed-in preference without recreating the Supabase client (avoids losing JWT). */
export function prepareNativeAuthSession(staySignedIn: boolean) {
  void AsyncStorage.setItem(STAY_SIGNED_IN_PREF_KEY, String(staySignedIn));
  return getSupabaseClient();
}

export { isNativeSupabaseConfigured } from '@gardening/shared/supabase/client-native';
