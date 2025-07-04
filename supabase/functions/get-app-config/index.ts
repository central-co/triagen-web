import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const config = {
    apiUrl: Deno.env.get("API_URL"),
    livekitUrl: Deno.env.get("LIVEKIT_URL"),
    recaptchaSiteKey: Deno.env.get("RECAPTCHA_SITE_KEY")
  }

  // Verifica se todas as variáveis estão configuradas
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)

  if (missingVars.length > 0) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables",
        missing: missingVars
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  return new Response(
    JSON.stringify(config),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  )
})
