'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { formatAuthError } from './formatAuthError';

export interface User {
  id: string;
  email: string;
}

export interface SignUpOptions {
  emailRedirectTo?: string;
  staySignedIn?: boolean;
}

export interface SignInOptions {
  staySignedIn?: boolean;
}

export interface SignUpResult {
  data: unknown;
  error: { message: string } | null;
  needsEmailConfirmation: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string,
    options?: SignInOptions
  ) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  clearError: () => void;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  supabase: SupabaseClient;
  prepareAuthSession?: (staySignedIn: boolean) => SupabaseClient;
}

export function AuthProvider({
  children,
  supabase: initialSupabase,
  prepareAuthSession,
}: AuthProviderProps) {
  const [supabase, setSupabase] = useState(initialSupabase);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Session restore failed:', sessionError.message);
          setUser(null);
        } else {
          setUser(
            session?.user
              ? { id: session.user.id, email: session.user.email ?? '' }
              : null
          );
        }
      } catch (err) {
        console.warn('Error getting session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null
      );
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const resolveClient = (staySignedIn?: boolean) => {
    if (staySignedIn === undefined || !prepareAuthSession) {
      return supabase;
    }
    const nextClient = prepareAuthSession(staySignedIn);
    setSupabase(nextClient);
    return nextClient;
  };

  const signIn = async (email: string, password: string, options?: SignInOptions) => {
    setError(null);
    const client = resolveClient(options?.staySignedIn);
    try {
      const { error: signInError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        const message = formatAuthError(signInError.message);
        setError(message);
        return { error: { message } };
      }
      return { error: null };
    } catch (err) {
      const message = formatAuthError(
        err instanceof Error ? err.message : 'Network request failed. Check your connection.'
      );
      setError(message);
      return { error: { message } };
    }
  };

  const signUp = async (email: string, password: string, options?: SignUpOptions) => {
    setError(null);
    const client = resolveClient(options?.staySignedIn);
    const { data, error: signUpError } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: options?.emailRedirectTo
        ? { emailRedirectTo: options.emailRedirectTo }
        : undefined,
    });
    if (signUpError) {
      const message = formatAuthError(signUpError.message);
      setError(message);
      return { data: null, error: { message }, needsEmailConfirmation: false };
    }
    return {
      data,
      error: null,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    };
  };

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError: () => setError(null),
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
