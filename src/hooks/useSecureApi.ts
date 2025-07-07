import { useState, useCallback } from 'react';
import { ApiSecurityError, secureFetch, ApiSecurityOptions } from '../utils/apiSecurity';

interface UseSecureApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseSecureApiReturn<T> extends UseSecureApiState<T> {
  execute: (url: string, options?: RequestInit & { security?: ApiSecurityOptions }) => Promise<T>;
  reset: () => void;
}

export function useSecureApi<T = any>(): UseSecureApiReturn<T> {
  const [state, setState] = useState<UseSecureApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    url: string,
    options: RequestInit & { security?: ApiSecurityOptions } = {}
  ): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await secureFetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new ApiSecurityError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }
      
      const result = await response.json();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      if (error instanceof ApiSecurityError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}