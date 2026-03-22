/**
 * Simple in-memory rate limiter using sliding window.
 * For production, consider Redis-based or edge middleware solutions.
 */

interface RateLimitEntry {
  readonly count: number;
  readonly resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  readonly maxRequests: number;
  /** Window duration in milliseconds */
  readonly windowMs: number;
}

interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * Returns whether the request is allowed and how many requests remain.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  // No existing entry or expired window → allow and start new window
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // Within window, check count
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Increment count (create new entry for immutability)
  const updated: RateLimitEntry = {
    count: existing.count + 1,
    resetAt: existing.resetAt,
  };
  store.set(key, updated);

  return {
    allowed: true,
    remaining: config.maxRequests - updated.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Extract a rate-limit key from a request.
 * Uses the rightmost IP from X-Forwarded-For (appended by the reverse proxy,
 * not user-controlled) or X-Real-IP, falling back to a default.
 * For Vercel deployments, prefers x-vercel-forwarded-for.
 */
export function getClientIdentifier(request: Request): string {
  // Vercel sets this header — not overridable by clients
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const ips = vercelIp.split(",").map((s) => s.trim());
    return ips[ips.length - 1];
  }

  // For other proxies, use the rightmost IP (proxy-appended, not user-controlled)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    return ips[ips.length - 1];
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "anonymous";
}

/** Default rate limit configs for different endpoint types */
export const RATE_LIMITS = {
  /** Chat endpoints: 20 requests per minute */
  chat: { maxRequests: 20, windowMs: 60_000 } as const,
  /** General API endpoints: 60 requests per minute */
  api: { maxRequests: 60, windowMs: 60_000 } as const,
  /** Streaming endpoints: 10 requests per minute */
  stream: { maxRequests: 10, windowMs: 60_000 } as const,
  /** Product check endpoints: 5 requests per minute (expensive vision calls) */
  productCheck: { maxRequests: 5, windowMs: 60_000 } as const,
} as const;
