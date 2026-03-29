/**
 * Admin-only access guard.
 * Only whitelisted emails can access admin endpoints (QA dashboard, etc.)
 */

import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./server";

/** Emails allowed to access admin endpoints */
const ADMIN_EMAILS: ReadonlySet<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "marco@otherhand.ca")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Require admin access. Returns 401 if not logged in, 403 if not admin.
 */
export async function requireAdmin(): Promise<
  { readonly user: { readonly id: string; readonly email: string } } | NextResponse
> {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const email = user.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.has(email)) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }

  return { user: { id: user.id, email } };
}

/**
 * Type guard for admin auth result.
 */
export function isAdminSuccess(
  result: Awaited<ReturnType<typeof requireAdmin>>,
): result is { readonly user: { readonly id: string; readonly email: string } } {
  return !(result instanceof NextResponse);
}
