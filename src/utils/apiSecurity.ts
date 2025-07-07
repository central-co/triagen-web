// Simplified API security utilities - headers only, validation on backend

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

// Enhanced fetch wrapper with security headers (validation happens on backend)
export async function secureFetch(
  url: string,
  options: RequestInit & { security?: ApiSecurityOptions } = {}
): Promise<Response> {
  const { security = {}, ...fetchOptions } = options;
  
  // Add security headers for backend validation
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
  
  // Check for security-related response headers from backend
  const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
  
  if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
    console.warn('Rate limit warning: Only', rateLimitRemaining, 'requests remaining');
  }
  
  return response;
}

// Legacy function wrapper for backward compatibility
export function secureApiCall<T>(
  apiCall: () => Promise<T>,
  options: ApiSecurityOptions = {}
): Promise<T> {
  console.warn('secureApiCall is deprecated. Use secureFetch directly or implement validation on backend.');
  return apiCall();
}