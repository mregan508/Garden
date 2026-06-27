import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { memoryAuthStorage } from './auth-storage';
import { createNativeAuthStorage } from './native-auth-storage';

export interface NativeSupabaseClientOptions {
  staySignedIn?: boolean;
}

function readNativeSupabaseEnv() {
  return {
    supabaseUrl: (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim(),
    supabaseAnonKey: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
  };
}

export function createNativeSupabaseClient(
  options: NativeSupabaseClientOptions = {}
): SupabaseClient {
  const staySignedIn = options.staySignedIn ?? true;
  const { supabaseUrl, supabaseAnonKey } = readNativeSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Expo public Supabase env vars: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  const storage = staySignedIn
    ? createNativeAuthStorage(AsyncStorage)
    : memoryAuthStorage;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export function isNativeSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = readNativeSupabaseEnv();
  return Boolean(supabaseUrl && supabaseAnonKey);
}
