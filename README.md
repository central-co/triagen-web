# triagen-web

This project uses Vite with React and TypeScript.

## Configuration

This application uses a hybrid configuration approach:

### Local Environment Variables (Required)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Edge Function Configuration (Recommended)
The following variables are managed by the `get-app-config` Edge Function and should be configured in your Supabase Edge Function environment:

- `API_URL`: Your API server URL
- `LIVEKIT_URL`: Your LiveKit WebSocket server URL (must start with `ws://` or `wss://`)
- `RECAPTCHA_SITE_KEY`: Your reCAPTCHA site key (optional)

### Fallback Environment Variables (Development Only)
For local development, you can optionally set these fallback variables:

- `VITE_API_URL`: Fallback API URL
- `VITE_LIVEKIT_URL`: Fallback LiveKit URL
- `VITE_RECAPTCHA_SITE_KEY`: Fallback reCAPTCHA site key

## Local Development

1. Copy `.env.example` to `.env`
2. Set the required Supabase variables in your `.env` file
3. Configure the Edge Function variables in your Supabase dashboard
4. Run `npm install` followed by `npm run dev`

## Configuration Loading

The application automatically loads configuration from:
1. **Primary**: Supabase Edge Function `get-app-config` (recommended for production)
2. **Fallback**: Local environment variables (for development)

This approach provides:
- ✅ Centralized configuration management
- ✅ Dynamic configuration updates without redeployment
- ✅ Secure environment variable handling
- ✅ Development fallback support

## Edge Function Setup

To configure your Edge Function variables:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Select the `get-app-config` function
4. Set the environment variables:
   - `API_URL`
   - `LIVEKIT_URL`
   - `RECAPTCHA_SITE_KEY` (optional)

## Build

The configuration will be loaded dynamically at runtime, so no build-time environment variables are needed for the Edge Function managed variables.

Run `npm run build` to build the project for production.