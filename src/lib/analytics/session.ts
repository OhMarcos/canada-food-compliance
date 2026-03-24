/**
 * Anonymous session identification.
 * Creates a consistent hash from IP + User-Agent for tracking
 * user journeys without storing PII.
 */

import "server-only";

/**
 * Generate an anonymous session ID from request headers.
 * Uses SHA-256 hash of IP + User-Agent for consistency.
 */
export async function getSessionId(request: Request): Promise<string> {
  const ip = getIp(request);
  const ua = request.headers.get("user-agent") ?? "unknown";
  const raw = `${ip}:${ua}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function getIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const ips = vercelIp.split(",").map((s) => s.trim());
    return ips[ips.length - 1];
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    return ips[ips.length - 1];
  }

  return request.headers.get("x-real-ip") ?? "anonymous";
}
