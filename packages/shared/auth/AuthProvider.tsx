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
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  clearError: () => void;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  supabase: SupabaseClient;
}

export function AuthProvider({ children, supabase }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(
          session?.user
            ? { id: session.user.id, email: session.user.email ?? '' }
            : null
        );
      } catch (err) {
        console.error('Error getting session:', err);
        setError('Failed to get session');
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

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      const message = formatAuthError(signInError.message);
      setError(message);
      return { error: { message } };
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, options?: SignUpOptions) => {
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
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
