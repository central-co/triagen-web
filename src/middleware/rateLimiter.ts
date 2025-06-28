// Rate limiting middleware for API calls
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(identifier: string): string {
    return this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
  }

  public isAllowed(identifier: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    const key = this.getKey(identifier);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      // Reset or create new entry
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      return { 
        allowed: true, 
        resetTime: this.store[key].resetTime,
        remaining: this.config.maxRequests - 1
      };
    }

    if (this.store[key].count >= this.config.maxRequests) {
      return { 
        allowed: false, 
        resetTime: this.store[key].resetTime,
        remaining: 0
      };
    }

    this.store[key].count++;
    return { 
      allowed: true, 
      resetTime: this.store[key].resetTime,
      remaining: this.config.maxRequests - this.store[key].count
    };
  }
}

// Rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const interviewRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 interview starts per hour
});

export const waitlistRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 waitlist submissions per hour
});