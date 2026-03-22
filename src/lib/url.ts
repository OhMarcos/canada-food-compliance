/**
 * URL validation utilities.
 * Prevents javascript:, data:, and other dangerous URL schemes
 * from being rendered as clickable links.
 */

const SAFE_PROTOCOLS = new Set(["https:", "http:"]);

/**
 * Check if a URL is safe to render as an href.
 * Only allows http: and https: protocols.
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize a URL: return it if safe, undefined otherwise.
 * Use on server side before including URLs in API responses.
 */
export function sanitizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!SAFE_PROTOCOLS.has(parsed.protocol)) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}
