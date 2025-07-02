
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../integrations/supabase/types';

// Create optimized Supabase client with performance configurations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yujxrfdoemrdghfwaexx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1anhyZmRvZW1yZGdoZndhZXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MzA0MDksImV4cCI6MjA2NTEwNjQwOX0.yL-sEXoDrSOXAdsgxdlfRqoQdo1BH6DvXwLdIt-kdd0';

export const optimizedSupabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'triagen-web-app'
    }
  }
});

// Simplified cache management
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  generateKey(tableName: string, options: any): string {
    return `${tableName}:${JSON.stringify(options)}`;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  invalidateOnMutation(tableName: string): void {
    this.invalidate(tableName);
  }
}

export const queryCache = new QueryCache();
export const cacheManager = queryCache;

// Health check utility
export async function healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const startTime = performance.now();
  
  try {
    await optimizedSupabase.from('jobs').select('id').limit(1);
    const latency = performance.now() - startTime;
    
    return {
      healthy: true,
      latency: Math.round(latency)
    };
  } catch (error) {
    return {
      healthy: false,
      latency: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
