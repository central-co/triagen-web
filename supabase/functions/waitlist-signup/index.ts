import { createClient } from 'npm:@supabase/supabase-js@2';

interface WaitlistData {
  email: string;
  name: string;
  company?: string;
  job_title?: string;
  newsletter_consent: boolean;
  recaptcha_token: string;
}

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  'error-codes'?: string[];
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-ID, X-Timestamp, X-CSRF-Token',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

// In-memory rate limiting (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {};

function cleanupRateLimit() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}

function checkRateLimit(clientId: string, maxRequests: number = 3, windowMs: number = 60 * 60 * 1000): boolean {
  cleanupRateLimit();
  
  const now = Date.now();
  
  if (!rateLimitStore[clientId] || rateLimitStore[clientId].resetTime < now) {
    rateLimitStore[clientId] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }
  
  if (rateLimitStore[clientId].count >= maxRequests) {
    return false;
  }
  
  rateLimitStore[clientId].count++;
  return true;
}

function validateSecurityHeaders(request: Request): { valid: boolean; clientId?: string; error?: string } {
  const clientId = request.headers.get('X-Client-ID');
  const timestamp = request.headers.get('X-Timestamp');
  const csrfToken = request.headers.get('X-CSRF-Token');
  
  if (!clientId) {
    return { valid: false, error: 'Missing client identification' };
  }
  
  if (!timestamp) {
    return { valid: false, error: 'Missing timestamp' };
  }
  
  // Check timestamp is within reasonable range (5 minutes)
  const requestTime = parseInt(timestamp);
  const now = Date.now();
  const timeDiff = Math.abs(now - requestTime);
  
  if (timeDiff > 5 * 60 * 1000) {
    return { valid: false, error: 'Request timestamp too old' };
  }
  
  // CSRF token validation for state-changing operations
  if (!csrfToken) {
    return { valid: false, error: 'Missing CSRF token' };
  }
  
  return { valid: true, clientId };
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data: RecaptchaResponse = await response.json();
    
    // For reCAPTCHA v3, check score (0.0 to 1.0, higher is better)
    // For reCAPTCHA v2, just check success
    return data.success && (data.score === undefined || data.score >= 0.5);
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

async function sendConfirmationEmail(email: string, name: string): Promise<boolean> {
  const emailApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY');
  if (!emailApiKey) {
    console.error('EMAIL_SERVICE_API_KEY not configured');
    return false;
  }

  try {
    // Using Resend as the email service (you can change this to your preferred service)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TriaGen <noreply@triagen.com.br>',
        to: [email],
        subject: 'Bem-vindo à lista de espera do TriaGen! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1B2A41; margin: 0;">TriaGen</h1>
              <p style="color: #6B7280; margin: 5px 0;">Sua IA entrevista enquanto você foca no que importa</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1B2A41, #00AEEF); padding: 30px; border-radius: 16px; color: white; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0;">Obrigado por se juntar à nossa lista de espera!</h2>
              <p style="margin: 0; opacity: 0.9;">Olá ${name}, você está entre os primeiros a conhecer o futuro do recrutamento com IA.</p>
            </div>
            
            <div style="background: #F9FAFB; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
              <h3 style="color: #1F2937; margin: 0 0 15px 0;">O que vem por aí:</h3>
              <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Acesso antecipado à plataforma</li>
                <li style="margin-bottom: 8px;">Teste gratuito com 5 candidatos</li>
                <li style="margin-bottom: 8px;">Suporte prioritário durante o beta</li>
                <li style="margin-bottom: 8px;">Desconto especial no lançamento</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <p style="color: #6B7280; margin: 0 0 15px 0;">Enquanto isso, que tal conhecer mais sobre como nossa IA pode transformar seu recrutamento?</p>
              <a href="https://triagen.com.br" style="display: inline-block; background: linear-gradient(135deg, #1B2A41, #00AEEF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visitar Site</a>
            </div>
            
            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
              <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
                © 2025 TriaGen. Todos os direitos reservados.<br>
                Você está recebendo este email porque se inscreveu em nossa lista de espera.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email sending failed:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Validate security headers
    const securityCheck = validateSecurityHeaders(req);
    if (!securityCheck.valid) {
      return new Response(
        JSON.stringify({ error: securityCheck.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(securityCheck.clientId!)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Reset': (Date.now() + 60 * 60 * 1000).toString()
          },
        }
      );
    }

    const data: WaitlistData = await req.json();

    // Validate required fields
    if (!data.email || !data.name || data.newsletter_consent === undefined) {
      return new Response(
        JSON.stringify({ error: 'Email, name, and newsletter consent are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify reCAPTCHA
    if (!data.recaptcha_token) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isRecaptchaValid = await verifyRecaptcha(data.recaptcha_token);
    if (!isRecaptchaValid) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification failed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into waitlist
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        company: data.company?.trim() || null,
        job_title: data.job_title?.trim() || null,
        newsletter_consent: data.newsletter_consent,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      
      // Handle duplicate email error
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Este email já está cadastrado em nossa lista de espera' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao processar cadastro. Tente novamente.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send confirmation email
    const emailSent = await sendConfirmationEmail(data.email, data.name);

    if (!emailSent) {
      console.warn('Confirmation email failed to send');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Falha ao enviar email de confirmação',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cadastro realizado com sucesso!'
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': (3 - (rateLimitStore[securityCheck.clientId!]?.count || 0)).toString()
        },
      }
    );

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});