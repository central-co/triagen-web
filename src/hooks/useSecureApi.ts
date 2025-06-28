import { useState, useCallback } from 'react';
import { ApiSecurityError, secureApiCall, ApiSecurityOptions } from '../utils/apiSecurity';

interface UseSecureApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseSecureApiReturn<T> extends UseSecureApiState<T> {
  execute: (apiCall: () => Promise<T>, options?: ApiSecurityOptions) => Promise<T>;
  reset: () => void;
}

export function useSecureApi<T = any>(): UseSecureApiReturn<T> {
  const [state, setState] = useState<UseSecureApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options: ApiSecurityOptions = {}
  ): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await secureApiCall(apiCall, options);
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