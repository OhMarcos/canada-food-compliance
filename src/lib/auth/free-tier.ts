/**
 * Free-tier access control for API routes.
 *
 * - Anonymous (no login): 1 free use, tracked via HMAC-signed cookie + server-side IP backup
 * - Registered users: daily usage cap per endpoint (resets at midnight UTC)
 *
 * Replaces requireTokens() for the free-tier deployment.
 */

import "server-only";
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./server";
import { getClientIdentifier } from "@/lib/rate-limit";
import type { User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FreeTierSuccess {
  readonly user: User | null;
  readonly isAnonymous: boolean;
}

type FreeTierResult = FreeTierSuccess | NextResponse;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum anonymous uses (across ALL endpoints combined) */
const ANONYMOUS_MAX_USES = 1;

/** Daily usage caps per endpoint for registered users */
const DAILY_CAPS: Readonly<Record<string, number>> = {
  chat: 10,
  "chat-stream": 10,
  "product-check": 3,
  checklist: 5,
  market: 10,
} as const;

const DEFAULT_DAILY_CAP = 5;

/** Cookie name for tracking anonymous usage */
const GUEST_COOKIE = "cb_guest_uses";

/** HMAC secret for signing the guest cookie */
const COOKIE_SECRET = (() => {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error(
      "CRITICAL: COOKIE_SIGNING_SECRET is not set in production. " +
      "Guest tracking cookies can be forged. Set this env var immediately.",
    );
  }
  return secret ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "clearbite-default-secret";
})();

// ---------------------------------------------------------------------------
// HMAC-signed cookie helpers (prevents tampering)
// ---------------------------------------------------------------------------

function signValue(value: string): string {
  const hmac = createHmac("sha256", COOKIE_SECRET);
  hmac.update(value);
  return `${value}.${hmac.digest("hex").slice(0, 16)}`;
}

function verifySignedValue(signed: string): number | null {
  const dotIndex = signed.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const value = signed.slice(0, dotIndex);
  const expected = signValue(value);

  if (expected !== signed) return null; // Tampered
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Server-side anonymous tracking (IP-based backup — prevents cookie clearing)
// ---------------------------------------------------------------------------

interface AnonymousUsage {
  readonly count: number;
  readonly date: string;
}

const anonymousIpStore = new Map<string, AnonymousUsage>();

function getAnonymousIpUsage(ip: string): number {
  const today = getTodayUTC();
  const entry = anonymousIpStore.get(ip);
  if (!entry || entry.date !== today) return 0;
  return entry.count;
}

function incrementAnonymousIpUsage(ip: string): void {
  const today = getTodayUTC();
  const existing = anonymousIpStore.get(ip);
  const count = existing && existing.date === today ? existing.count + 1 : 1;
  anonymousIpStore.set(ip, { count, date: today });
}

// ---------------------------------------------------------------------------
// In-memory daily usage store (resets on server restart or at midnight UTC)
// NOTE: For multi-instance production, migrate to Redis or DB.
// ---------------------------------------------------------------------------

interface DailyUsage {
  readonly count: number;
  readonly date: string; // YYYY-MM-DD in UTC
}

/** Map of "userId:endpoint" → DailyUsage */
const dailyUsageStore = new Map<string, DailyUsage>();

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyUsage(userId: string, endpoint: string): number {
  const key = `${userId}:${endpoint}`;
  const entry = dailyUsageStore.get(key);
  const today = getTodayUTC();

  if (!entry || entry.date !== today) return 0;
  return entry.count;
}

function incrementDailyUsage(userId: string, endpoint: string): void {
  const key = `${userId}:${endpoint}`;
  const today = getTodayUTC();
  const existing = dailyUsageStore.get(key);

  const count = existing && existing.date === today ? existing.count + 1 : 1;
  dailyUsageStore.set(key, { count, date: today });
}

// Prune stale entries every 10 minutes (lazy init to avoid side effects on import)
let cleanupInitialized = false;

function ensureCleanup(): void {
  if (cleanupInitialized) return;
  cleanupInitialized = true;

  setInterval(() => {
    const today = getTodayUTC();
    for (const [key, entry] of dailyUsageStore) {
      if (entry.date !== today) dailyUsageStore.delete(key);
    }
    for (const [key, entry] of anonymousIpStore) {
      if (entry.date !== today) anonymousIpStore.delete(key);
    }
  }, 600_000);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check free-tier access for an API request.
 *
 * Returns:
 * - FreeTierSuccess if allowed (user may be null for anonymous)
 * - NextResponse error:
 *   - 401 + GUEST_LIMIT: anonymous user exceeded free use
 *   - 429 + DAILY_LIMIT: registered user exceeded daily cap
 */
export async function requireFreeTier(
  request: NextRequest,
  endpoint: string,
): Promise<FreeTierResult> {
  ensureCleanup();
  const { user } = await getCurrentUser();

  // --- Authenticated user: check daily cap ---
  if (user) {
    const cap = DAILY_CAPS[endpoint] ?? DEFAULT_DAILY_CAP;
    const used = getDailyUsage(user.id, endpoint);

    if (used >= cap) {
      return NextResponse.json(
        {
          error: "Daily usage limit reached. Come back tomorrow!",
          error_ko: "일일 사용 한도에 도달했습니다. 내일 다시 이용해주세요!",
          code: "DAILY_LIMIT",
          limit: cap,
          used,
          resets_at: `${getTodayUTC()}T24:00:00Z`,
        },
        { status: 429 },
      );
    }

    return { user, isAnonymous: false };
  }

  // --- Anonymous user: check signed cookie + server-side IP backup ---
  const clientIp = getClientIdentifier(request);
  const ipUses = getAnonymousIpUsage(clientIp);

  const cookieValue = request.cookies.get(GUEST_COOKIE)?.value;
  const cookieUses = cookieValue ? (verifySignedValue(cookieValue) ?? 0) : 0;

  // Use the higher of cookie or IP tracking (prevents both cookie-clear and IP-spoof)
  const guestUses = Math.max(cookieUses, ipUses);

  if (guestUses >= ANONYMOUS_MAX_USES) {
    return NextResponse.json(
      {
        error: "Sign up for free to continue using ClearBite.",
        error_ko: "계속 사용하려면 무료 가입을 해주세요.",
        code: "GUEST_LIMIT",
        max_uses: ANONYMOUS_MAX_USES,
      },
      { status: 401 },
    );
  }

  return { user: null, isAnonymous: true };
}

/**
 * Record a successful API usage.
 * Call AFTER the request succeeds (fire-and-forget pattern).
 *
 * For anonymous users, returns a Set-Cookie header value to include in the response.
 * For authenticated users, increments the in-memory daily counter.
 */
export function recordFreeTierUsage(
  request: NextRequest,
  result: FreeTierSuccess,
  endpoint: string,
): string | null {
  if (result.user) {
    incrementDailyUsage(result.user.id, endpoint);
    return null;
  }

  // Anonymous: increment both cookie and IP tracker
  const clientIp = getClientIdentifier(request);
  incrementAnonymousIpUsage(clientIp);

  const cookieValue = request.cookies.get(GUEST_COOKIE)?.value;
  const currentUses = cookieValue ? (verifySignedValue(cookieValue) ?? 0) : 0;
  const signedNewValue = signValue(String(currentUses + 1));

  return `${GUEST_COOKIE}=${signedNewValue}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; HttpOnly`;
}

/**
 * Type guard: checks if result is a success (not a NextResponse error).
 */
export function isFreeTierSuccess(
  result: FreeTierResult,
): result is FreeTierSuccess {
  return !(result instanceof NextResponse);
}

/**
 * Get remaining daily uses for a user.
 */
export function getRemainingUses(userId: string, endpoint: string): number {
  const cap = DAILY_CAPS[endpoint] ?? DEFAULT_DAILY_CAP;
  const used = getDailyUsage(userId, endpoint);
  return Math.max(0, cap - used);
}

/**
 * Get all daily caps (for displaying to users).
 */
export function getDailyCaps(): Readonly<Record<string, number>> {
  return DAILY_CAPS;
}
