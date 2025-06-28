// Configuration validation utilities

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  livekitUrl: string;
  apiUrl: string;
  recaptchaSiteKey?: string;
}

export function validateConfig(): AppConfig {
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    livekitUrl: import.meta.env.VITE_LIVEKIT_WS_URL || import.meta.env.VITE_LIVEKIT_URL,
    apiUrl: import.meta.env.VITE_API_URL,
    recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  };

  const errors: string[] = [];

  if (!config.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required');
  }

  if (!config.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  if (!config.livekitUrl) {
    errors.push('VITE_LIVEKIT_WS_URL or VITE_LIVEKIT_URL is required');
  } else if (!config.livekitUrl.startsWith('ws://') && !config.livekitUrl.startsWith('wss://')) {
    errors.push('LiveKit URL must be a WebSocket URL (starting with ws:// or wss://)');
  }

  if (!config.apiUrl) {
    errors.push('VITE_API_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }

  return config as AppConfig;
}

export function getConfig(): AppConfig {
  try {
    return validateConfig();
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw error;
  }
}