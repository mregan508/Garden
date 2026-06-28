import type { SupabaseClient } from '@supabase/supabase-js';

/** Resolve the authenticated user id from the Supabase session (required for RLS). */
export async function requireAuthUserId(
  supabase: SupabaseClient
): Promise<{ userId: string | null; error: string | null }> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return { userId: null, error: sessionError.message };
  }

  if (!session?.user) {
    return { userId: null, error: 'You must be signed in to continue.' };
  }

  return { userId: session.user.id, error: null };
}
