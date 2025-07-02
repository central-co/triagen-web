import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../integrations/supabase/types';

// Create optimized Supabase client with performance configurations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Connection pool for better performance
class ConnectionPool {
  private connections: Map<string, SupabaseClient> = new Map();
  private maxConnections = 5;

  getConnection(key: string = 'default'): SupabaseClient {
    if (!this.connections.has(key) && this.connections.size < this.maxConnections) {
      this.connections.set(key, optimizedSupabase);
    }
    return this.connections.get(key) || optimizedSupabase;
  }

  closeConnection(key: string): void {
    if (this.connections.has(key)) {
      this.connections.delete(key);
    }
  }

  closeAllConnections(): void {
    this.connections.clear();
  }
}

export const connectionPool = new ConnectionPool();

// Query optimization utilities
export interface QueryFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: any;
}

export interface QueryOptions {
  select?: string;
  filters?: QueryFilter[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  single?: boolean;
}

// Optimized query builder
export class OptimizedQueryBuilder {
  constructor(private client: SupabaseClient, private tableName: string) {}

  async execute<T = any>(options: QueryOptions = {}): Promise<{ data: T[] | null; error: any; count?: number }> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(options.select || '*', { count: 'exact' });

      // Apply filters
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Execute query
      const result = options.single ? await query.single() : await query;
      
      return {
        data: result.data as T[],
        error: result.error,
        count: result.count || undefined
      };
    } catch (error) {
      console.error('Query execution error:', error);
      return {
        data: null,
        error: error,
        count: undefined
      };
    }
  }
}

// Cache management
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  generateKey(tableName: string, options: QueryOptions): string {
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

  size(): number {
    return this.cache.size;
  }
}

export const queryCache = new QueryCache();

// Optimized data service
export class OptimizedDataService {
  constructor(private tableName: string, private useCache: boolean = true) {}

  async query<T = any>(options: QueryOptions = {}): Promise<{ data: T[] | null; error: any; count?: number }> {
    const cacheKey = queryCache.generateKey(this.tableName, options);
    
    // Check cache first
    if (this.useCache) {
      const cached = queryCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Execute query
    const builder = new OptimizedQueryBuilder(optimizedSupabase, this.tableName);
    const result = await builder.execute<T>(options);

    // Cache successful results
    if (this.useCache && !result.error) {
      queryCache.set(cacheKey, result);
    }

    return result;
  }

  async insert<T = any>(data: any): Promise<{ data: T | null; error: any }> {
    const result = await optimizedSupabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    // Invalidate related cache entries
    if (this.useCache && !result.error) {
      queryCache.invalidate(this.tableName);
    }

    return result;
  }

  async update<T = any>(filters: QueryFilter[], data: any): Promise<{ data: T[] | null; error: any }> {
    let query = optimizedSupabase.from(this.tableName).update(data);
    
    filters.forEach(filter => {
      query = query.filter(filter.column, filter.operator, filter.value);
    });

    const result = await query.select();

    // Invalidate related cache entries
    if (this.useCache && !result.error) {
      queryCache.invalidate(this.tableName);
    }

    return result;
  }

  async delete(filters: QueryFilter[]): Promise<{ data: any | null; error: any }> {
    let query = optimizedSupabase.from(this.tableName).delete();
    
    filters.forEach(filter => {
      query = query.filter(filter.column, filter.operator, filter.value);
    });

    const result = await query;

    // Invalidate related cache entries
    if (this.useCache && !result.error) {
      queryCache.invalidate(this.tableName);
    }

    return result;
  }

  // Batch operations for better performance
  async batchInsert<T = any>(data: any[]): Promise<{ data: T[] | null; error: any }> {
    const result = await optimizedSupabase
      .from(this.tableName)
      .insert(data)
      .select();

    if (this.useCache && !result.error) {
      queryCache.invalidate(this.tableName);
    }

    return result;
  }

  // Subscription management
  subscribe(
    filters: QueryFilter[] = [],
    callback: (payload: any) => void
  ) {
    let channel = optimizedSupabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName
        },
        callback
      );

    return channel.subscribe();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const times = this.metrics.get(operation)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getAllMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((times, operation) => {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length
      };
    });
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Error handling and retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
}

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
