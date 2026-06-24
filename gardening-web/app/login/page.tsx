'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readStaySignedInPreference, STAY_SIGNED_IN_PREF_KEY, useAuth } from '@gardening/shared';
import { authRedirectUrl } from '@/lib/basePath';

export default function LoginPage() {
  const { signIn, signUp, error, clearError, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return readStaySignedInPreference(localStorage.getItem(STAY_SIGNED_IN_PREF_KEY));
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50">
        <p className="text-emerald-800">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(null);
    setSubmitting(true);

    if (isSignUp) {
      const { error: signUpError, needsEmailConfirmation } = await signUp(email, password, {
        emailRedirectTo: authRedirectUrl('/auth/confirm'),
        staySignedIn,
      });
      if (!signUpError) {
        if (needsEmailConfirmation) {
          setMessage('Check your email to confirm your account, then sign in.');
          setIsSignUp(false);
        } else {
          router.replace('/');
        }
      }
    } else {
      const { error: signInError } = await signIn(email, password, { staySignedIn });
      if (!signInError) {
        router.replace('/');
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-green-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-emerald-900">Garden Map</h1>
        <p className="mb-6 text-sm text-emerald-700">
          Sign in to place and save plants on your garden map.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          {!isSignUp ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-600"
              />
              Stay signed in
            </label>
          ) : null}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            clearError();
            setMessage(null);
            setIsSignUp(!isSignUp);
          }}
          className="mt-4 w-full text-sm text-emerald-700 hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}
