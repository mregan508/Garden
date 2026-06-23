'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const confirm = async () => {
      const supabase = getSupabaseClient();
      const params = new URLSearchParams(window.location.search);

      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace('/');
          return;
        }
      }

      const tokenHash = params.get('token_hash');
      const type = params.get('type') as EmailOtpType | null;
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error) {
          router.replace('/');
          return;
        }
      }

      setStatus('error');
    };

    void confirm();
  }, [router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-4">
        <div className="text-center">
          <p className="text-red-600">This confirmation link is invalid or has expired.</p>
          <Link href="/login" className="mt-4 inline-block text-emerald-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50">
      <p className="text-emerald-800">Confirming your account...</p>
    </div>
  );
}
