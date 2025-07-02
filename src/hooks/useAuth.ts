
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setAuthState({
          user: session?.user ?? null,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setAuthState({
          user: session?.user ?? null,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  };
}
