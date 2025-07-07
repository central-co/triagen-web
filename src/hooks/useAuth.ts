
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true, // Mudança: começar com true para mostrar loading inicial
    error: null
  });

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (mounted) {
        setAuthState({
          user: session?.user ?? null,
          loading: false,
          error: null
        });
      }
    });

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          console.log('Initial session:', session?.user?.email);
          setAuthState({
            user: session?.user ?? null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (mounted) {
          console.error('Session error:', error);
          setAuthState({
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication error'
          });
        }
      }
    };

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log('Sign in successful');
      // Não fazemos setAuthState aqui, deixamos o onAuthStateChange cuidar disso
      return { error: null };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Sign in failed';
      console.error('Sign in error:', err);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err
      }));
      throw new Error(err);
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err
      }));
      throw new Error(err);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err
      }));
      throw new Error(err);
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  };
}
