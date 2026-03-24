/**
 * Server-side Supabase Auth client using @supabase/ssr.
 * Creates per-request clients that handle cookie-based sessions.
 */

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

export async function createAuthServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}

export async function getCurrentUser(): Promise<{
  readonly user: User | null;
  readonly error: Error | null;
}> {
  try {
    const supabase = await createAuthServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user: user ?? null, error: error ? new Error(error.message) : null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err : new Error("Auth error") };
  }
}
