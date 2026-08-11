export interface AppConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  livekitUrl: string;
  apiUrl: string;
  recaptchaSiteKey?: string;
}

export const config: AppConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL,
  apiUrl: import.meta.env.VITE_API_URL,
  // Treat a blank value as absent: some environments inject the variable as an
  // empty string, and passing "" to the reCAPTCHA widget throws at render time.
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() || undefined,
};
