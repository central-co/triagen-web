import { useState, useEffect } from 'react';
import { getConfig, AppConfig, isConfigLoaded, isConfigLoading } from '../utils/config';

interface UseAppConfigReturn {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAppConfig(): UseAppConfigReturn {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const appConfig = await getConfig();
      setConfig(appConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      setError(errorMessage);
      console.error('Configuration loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    await loadConfig();
  };

  useEffect(() => {
    // Check if config is already loaded
    if (isConfigLoaded()) {
      getConfig().then(setConfig).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to get cached config');
      }).finally(() => setLoading(false));
    } else if (!isConfigLoading()) {
      loadConfig();
    }
  }, []);

  return {
    config,
    loading,
    error,
    reload
  };
}