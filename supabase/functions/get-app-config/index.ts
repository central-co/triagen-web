import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const config = {
      apiUrl: Deno.env.get("API_URL"),
      livekitUrl: Deno.env.get("LIVEKIT_URL"), // Padronizado para LIVEKIT_URL
      recaptchaSiteKey: Deno.env.get("RECAPTCHA_SITE_KEY")
    }

    // Verifica se todas as variáveis obrigatórias estão configuradas
    const missingVars = Object.entries(config)
      .filter(([key, value]) => !value && key !== 'recaptchaSiteKey') // recaptchaSiteKey é opcional
      .map(([key, _]) => key)

    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars)
      return new Response(
        JSON.stringify({
          error: "Missing environment variables",
          missing: missingVars,
          details: "Please configure the missing environment variables in your Supabase Edge Function settings"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Validar formato da URL do LiveKit
    if (config.livekitUrl && !config.livekitUrl.startsWith('ws://') && !config.livekitUrl.startsWith('wss://')) {
      console.error('Invalid LIVEKIT_URL format:', config.livekitUrl)
      return new Response(
        JSON.stringify({
          error: "Invalid LIVEKIT_URL format",
          details: "LIVEKIT_URL must be a WebSocket URL starting with ws:// or wss://"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    console.log('✅ App configuration served successfully')
    
    return new Response(
      JSON.stringify(config),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300" // Cache por 5 minutos
        }
      }
    )
  } catch (error) {
    console.error('Error serving app config:', error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: "Failed to load application configuration"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})