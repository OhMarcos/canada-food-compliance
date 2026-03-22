/**
 * Supabase client singletons using globalThis for safety
 * across Next.js serverless/edge function instances and HMR.
 *
 * Uses lazy env var access (not import-time validation) to avoid
 * build failures when env vars aren't set during static generation.
 */

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as typeof globalThis & {
  anonClient?: SupabaseClient;
  adminClient?: SupabaseClient;
};

function getRequiredEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      "Please set it in your .env.local file or environment.",
    );
  }
  return value;
}

export function getSupabaseClient(): SupabaseClient {
  if (!globalForSupabase.anonClient) {
    globalForSupabase.anonClient = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  }
  return globalForSupabase.anonClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!globalForSupabase.adminClient) {
    globalForSupabase.adminClient = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    );
  }
  return globalForSupabase.adminClient;
}
