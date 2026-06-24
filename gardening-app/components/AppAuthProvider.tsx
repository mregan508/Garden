import { AuthProvider } from '@gardening/shared';
import { getSupabaseClient, prepareNativeAuthSession } from '@/lib/supabase';

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  return (
    <AuthProvider supabase={supabase} prepareAuthSession={prepareNativeAuthSession}>
      {children}
    </AuthProvider>
  );
}
