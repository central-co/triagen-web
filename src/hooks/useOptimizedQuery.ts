import { useState, useEffect, useCallback } from 'react';
import { OptimizedQueryBuilder, cacheManager } from '../utils/supabaseOptimized';

interface UseOptimizedQueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

interface UseOptimizedQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

export function useOptimizedQuery<T>(
  queryBuilder: () => OptimizedQueryBuilder<T>,
  dependencies: any[] = [],
  options: UseOptimizedQueryOptions = {}
): UseOptimizedQueryResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check if data is still fresh
    const now = Date.now();
    if (data && (now - lastFetch) < staleTime) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = queryBuilder();
      const result = await query.execute();

      if (result.error) {
        throw new Error(result.error.message || 'Query failed');
      }

      setData(result.data);
      setLastFetch(now);
    } catch (err) {
      console.error('Optimized query error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [enabled, staleTime, data, lastFetch, ...dependencies]);

  const invalidate = useCallback(() => {
    setData(null);
    setLastFetch(0);
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate
  };
}

// Hook for single record queries
export function useOptimizedSingleQuery<T>(
  queryBuilder: () => OptimizedQueryBuilder<T>,
  dependencies: any[] = [],
  options: UseOptimizedQueryOptions = {}
): Omit<UseOptimizedQueryResult<T>, 'data'> & { data: T | null } {
  const result = useOptimizedQuery(queryBuilder, dependencies, options);
  
  return {
    ...result,
    data: result.data?.[0] || null
  };
}

// Hook for mutations with cache invalidation
export function useOptimizedMutation<T>(
  mutationFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    invalidateTables?: string[];
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn();
      
      // Invalidate specified tables
      if (options.invalidateTables) {
        options.invalidateTables.forEach(table => {
          cacheManager.invalidateOnMutation(table);
        });
      }

      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error.message);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error
  };
}