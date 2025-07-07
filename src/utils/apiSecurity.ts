
import { apiRateLimiter, authRateLimiter, interviewRateLimiter, waitlistRateLimiter } from '../middleware/rateLimiter';

export interface ApiSecurityOptions {
  requireAuth?: boolean;
  rateLimitType?: 'api' | 'auth' | 'interview' | 'waitlist';
  validateOrigin?: boolean;
}

export class ApiSecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiSecurityError';
  }
}

export function getClientIdentifier(): string {
  // Use multiple factors for client identification
  const factors = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language
  ];
  
  // Simple hash function for client fingerprinting
  let hash = 0;
  const str = factors.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

export function validateOrigin(): boolean {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://triagen.app'
  ];
  
  const origin = window.location.origin;
  return allowedOrigins.includes(origin);
}

export function checkRateLimit(type: 'api' | 'auth' | 'interview' | 'waitlist' = 'api'): void {
  const identifier = getClientIdentifier();
  let limiter;
  
  switch (type) {
    case 'auth':
      limiter = authRateLimiter;
      break;
    case 'interview':
      limiter = interviewRateLimiter;
      break;
    case 'waitlist':
      limiter = waitlistRateLimiter;
      break;
    default:
      limiter = apiRateLimiter;
  }
  
  const result = limiter.isAllowed(identifier);
  
  if (!result.allowed) {
    const resetTime = new Date(result.resetTime || Date.now());
    throw new ApiSecurityError(
      `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`,
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

export function validateApiCall(options: ApiSecurityOptions = {}): void {
  const {
    requireAuth = false,
    rateLimitType = 'api',
    validateOrigin: shouldValidateOrigin = true
  } = options;
  
  // Validate origin
  if (shouldValidateOrigin && !validateOrigin()) {
    throw new ApiSecurityError(
      'Invalid origin',
      403,
      'INVALID_ORIGIN'
    );
  }
  
  // Check rate limits
  checkRateLimit(rateLimitType);
  
  // Additional auth validation can be added here
  if (requireAuth) {
    // This would integrate with your auth system
    // For now, we'll just check if we have basic auth tokens
    const hasAuth = localStorage.getItem('supabase.auth.token') || 
                   sessionStorage.getItem('supabase.auth.token');
    
    if (!hasAuth) {
      throw new ApiSecurityError(
        'Authentication required',
        401,
        'AUTH_REQUIRED'
      );
    }
  }
}

export function secureApiCall<T>(
  apiCall: () => Promise<T>,
  options: ApiSecurityOptions = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate the API call
      validateApiCall(options);
      
      // Execute the API call
      const result = await apiCall();
      resolve(result);
    } catch (error) {
      if (error instanceof ApiSecurityError) {
        reject(error);
      } else {
        // Log security-related errors for monitoring
        console.error('API Security Error:', error);
        reject(new ApiSecurityError('API call failed', 500, 'API_ERROR'));
      }
    }
  });
}

// Enhanced fetch wrapper with security
export async function secureFetch(
  url: string,
  options: RequestInit & { security?: ApiSecurityOptions } = {}
): Promise<Response> {
  const { security = {}, ...fetchOptions } = options;
  
  return secureApiCall(async () => {
    // Add security headers
    const headers = new Headers(fetchOptions.headers);
    headers.set('X-Client-ID', getClientIdentifier());
    headers.set('X-Timestamp', Date.now().toString());
    
    // Add CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method?.toUpperCase() || 'GET')) {
      const csrfToken = sessionStorage.getItem('csrf-token') || 
                       crypto.randomUUID();
      sessionStorage.setItem('csrf-token', csrfToken);
      headers.set('X-CSRF-Token', csrfToken);
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });
    
    // Check for security-related response headers
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    
    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
      console.warn('Rate limit warning: Only', rateLimitRemaining, 'requests remaining');
    }
    
    return response;
  }, security);
}
