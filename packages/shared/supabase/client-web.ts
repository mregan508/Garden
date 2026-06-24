import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserAuthStorage } from './auth-storage';

export function createWebSupabaseClient(staySignedIn = true): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
      auth: {
        storage: createBrowserAuthStorage(staySignedIn),
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
        detectSessionInUrl: typeof window !== 'undefined',
      },
    }
  );
}

export function isWebSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
