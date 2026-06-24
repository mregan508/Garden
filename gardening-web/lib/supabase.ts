import { createWebSupabaseClient } from '@gardening/shared/supabase/client-web';
import { readStaySignedInPreference, STAY_SIGNED_IN_PREF_KEY } from '@gardening/shared';

let client: ReturnType<typeof createWebSupabaseClient> | null = null;

function readWebStaySignedInPreference(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return readStaySignedInPreference(localStorage.getItem(STAY_SIGNED_IN_PREF_KEY));
}

export function getSupabaseClient() {
  if (!client) {
    client = createWebSupabaseClient(readWebStaySignedInPreference());
  }
  return client;
}

export function prepareWebAuthSession(staySignedIn: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STAY_SIGNED_IN_PREF_KEY, String(staySignedIn));
  }
  client = createWebSupabaseClient(staySignedIn);
  return client;
}
