/**
 * Auth and token middleware for API routes.
 * Provides requireAuth() and requireTokens() guards.
 */

import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./server";
import { tokenService } from "@/lib/tokens/service";
import type { User } from "@supabase/supabase-js";

interface AuthSuccess {
  readonly user: User;
}

type AuthResult = AuthSuccess | NextResponse;

/**
 * Require authenticated user. Returns 401 if not logged in.
 */
export async function requireAuth(): Promise<AuthResult> {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Authentication required", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  return { user };
}

/**
 * Require authenticated user with sufficient tokens.
 * Returns 401 if not logged in, 402 if insufficient tokens.
 */
export async function requireTokens(endpoint: string): Promise<AuthResult> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;
  const [balance, cost] = await Promise.all([
    tokenService.getUserBalance(user.id),
    tokenService.getTokenCost(endpoint),
  ]);

  if (!balance || balance.balance < cost) {
    return NextResponse.json(
      {
        error: "Insufficient tokens",
        code: "INSUFFICIENT_TOKENS",
        required: cost,
        balance: balance?.balance ?? 0,
      },
      { status: 402 },
    );
  }

  return { user };
}

/**
 * Consume tokens for an API action. Call AFTER the action succeeds.
 */
export async function consumeTokens(
  userId: string,
  endpoint: string,
  description?: string,
): Promise<boolean> {
  return tokenService.spendTokens(userId, endpoint, description);
}

/**
 * Type guard: checks if result is a success (not a NextResponse error).
 */
export function isAuthSuccess(result: AuthResult): result is AuthSuccess {
  return !(result instanceof NextResponse);
}
