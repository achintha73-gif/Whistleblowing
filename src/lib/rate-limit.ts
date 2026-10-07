import type { NextRequest } from 'next/server';

/**
 * Simple in-memory rate limiter.
 *
 * NOTE: This works for a single-server deployment (dev / demo).
 * For multi-server production, swap with Redis (e.g., Upstash).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Max number of requests allowed within the window */
  max: number;
  /** Window length in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  /** Seconds until the window resets */
  retryAfter: number;
}

// Global store (persists across requests in the same Node process)
const store = new Map<string, RateLimitEntry>();

// Prevent unbounded memory growth — cleanup every 5 minutes
if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as { __rateLimitCleanup?: NodeJS.Timeout };
  if (!g.__rateLimitCleanup) {
    g.__rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        if (entry.resetAt <= now) store.delete(key);
      }
    }, 5 * 60 * 1000);

    // Don't keep the process alive just for cleanup
    if (g.__rateLimitCleanup.unref) g.__rateLimitCleanup.unref();
  }
}

/**
 * Extract client IP from the request headers.
 * Supports proxies via x-forwarded-for.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback (Next dev / direct connections)
  return 'unknown';
}

/**
 * Check + increment the rate limit for a given identifier.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(identifier);

  // No entry OR expired window -> reset
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      remaining: config.max - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  // Within window
  if (entry.count >= config.max) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  store.set(identifier, entry);

  return {
    success: true,
    remaining: config.max - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  };
}

/**
 * Helper: build a rate-limit key from a request + route name.
 */
export function rateLimitKey(request: NextRequest, route: string): string {
  return `${route}:${getClientIp(request)}`;
}