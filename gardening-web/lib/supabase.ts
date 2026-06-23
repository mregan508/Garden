import { createWebSupabaseClient } from '@gardening/shared/supabase/client-web';

let client: ReturnType<typeof createWebSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createWebSupabaseClient();
  }
  return client;
}
