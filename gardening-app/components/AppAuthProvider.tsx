import { AuthProvider } from '@gardening/shared';
import { getSupabaseClient } from '@/lib/supabase';

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  return <AuthProvider supabase={supabase}>{children}</AuthProvider>;
}
