import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: null }>;
  signOut: () => Promise<{ error: null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Supabase emits a fresh user object on every TOKEN_REFRESHED / SIGNED_IN
  // event (including on tab refocus). Only propagate a new object when the
  // identity actually changes, so consumers don't re-render or re-fetch.
  const userRef = useRef<User | null>(null);

  const applyUser = (next: User | null) => {
    const prev = userRef.current;
    const sameIdentity = prev?.id === next?.id;
    if (!sameIdentity) {
      userRef.current = next;
      setUser(next);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    supabase.auth.getSession()
      .then(({ data: { session }, error: sessionError }) => {
        if (sessionError) throw sessionError;
        applyUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error('Session error:', err);
        userRef.current = null;
        setUser(null);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    signIn: async (email, password) => {
      setError(null);
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        throw new Error(err.message);
      }
      return { error: null };
    },
    signOut: async () => {
      setError(null);
      const { error: err } = await supabase.auth.signOut();
      if (err) {
        setError(err.message);
        throw new Error(err.message);
      }
      return { error: null };
    },
    signUp: async (email, password, metadata) => {
      setError(null);
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata, emailRedirectTo: `${window.location.origin}/` },
      });
      if (err) {
        setError(err.message);
        throw new Error(err.message);
      }
      return { error: null };
    },
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
