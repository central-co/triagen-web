// Configuration management with Edge Function integration

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  livekitUrl: string;
  apiUrl: string;
  recaptchaSiteKey?: string;
}

interface EdgeFunctionConfig {
  apiUrl: string;
  livekitUrl: string;
  recaptchaSiteKey?: string;
}

class ConfigManager {
  private config: AppConfig | null = null;
  private loading = false;
  private loadPromise: Promise<AppConfig> | null = null;

  async getConfig(): Promise<AppConfig> {
    // Return cached config if available
    if (this.config) {
      return this.config;
    }

    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading config
    this.loadPromise = this.loadConfigFromEdgeFunction();
    return this.loadPromise;
  }

  private async loadConfigFromEdgeFunction(): Promise<AppConfig> {
    try {
      this.loading = true;

      // Get Supabase config from environment (these stay local)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      }

      // Fetch dynamic config from Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/get-app-config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch app config: ${response.status} - ${errorText}`);
      }

      const edgeConfig: EdgeFunctionConfig = await response.json();

      // Validate required fields from Edge Function
      if (!edgeConfig.apiUrl) {
        throw new Error('API_URL not configured in Edge Function');
      }

      if (!edgeConfig.livekitUrl) {
        throw new Error('LIVEKIT_URL not configured in Edge Function');
      }

      // Validate LiveKit URL format
      if (!edgeConfig.livekitUrl.startsWith('ws://') && !edgeConfig.livekitUrl.startsWith('wss://')) {
        throw new Error('LIVEKIT_URL must be a WebSocket URL (starting with ws:// or wss://)');
      }

      // Combine local and remote config
      this.config = {
        supabaseUrl,
        supabaseAnonKey,
        livekitUrl: edgeConfig.livekitUrl,
        apiUrl: edgeConfig.apiUrl,
        recaptchaSiteKey: edgeConfig.recaptchaSiteKey,
      };

      console.log('✅ App configuration loaded successfully');
      return this.config;

    } catch (error) {
      console.error('❌ Failed to load app configuration:', error);
      
      // Fallback to environment variables with warning
      console.warn('⚠️ Falling back to environment variables');
      
      const fallbackConfig = this.getFallbackConfig();
      this.config = fallbackConfig;
      return fallbackConfig;
    } finally {
      this.loading = false;
    }
  }

  private getFallbackConfig(): AppConfig {
    const config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      livekitUrl: import.meta.env.VITE_LIVEKIT_URL,
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
      errors.push('VITE_LIVEKIT_URL is required');
    } else if (!config.livekitUrl.startsWith('ws://') && !config.livekitUrl.startsWith('wss://')) {
      errors.push('VITE_LIVEKIT_URL must be a WebSocket URL (starting with ws:// or wss://)');
    }

    if (!config.apiUrl) {
      errors.push('VITE_API_URL is required');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }

    return config as AppConfig;
  }

  // Method to invalidate cache and reload config
  async reloadConfig(): Promise<AppConfig> {
    this.config = null;
    this.loadPromise = null;
    return this.getConfig();
  }

  // Method to check if config is loaded
  isLoaded(): boolean {
    return this.config !== null;
  }

  // Method to check if currently loading
  isLoading(): boolean {
    return this.loading;
  }
}

// Singleton instance
const configManager = new ConfigManager();

// Main export function
export async function getConfig(): Promise<AppConfig> {
  return configManager.getConfig();
}

// Utility functions
export function isConfigLoaded(): boolean {
  return configManager.isLoaded();
}

export function isConfigLoading(): boolean {
  return configManager.isLoading();
}

export async function reloadConfig(): Promise<AppConfig> {
  return configManager.reloadConfig();
}

// Legacy function for backward compatibility (deprecated)
export function validateConfig(): AppConfig {
  console.warn('validateConfig() is deprecated. Use getConfig() instead.');
  throw new Error('validateConfig() is deprecated. Use async getConfig() instead.');
}