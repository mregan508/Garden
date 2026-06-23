import { createNativeSupabaseClient } from '@gardening/shared/supabase/client-native';

let client: ReturnType<typeof createNativeSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createNativeSupabaseClient();
  }
  return client;
}

export { isNativeSupabaseConfigured } from '@gardening/shared/supabase/client-native';
