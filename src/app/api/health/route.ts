/**
 * Health check endpoint.
 * Tests connectivity to all external dependencies (Supabase, Anthropic, OpenAI).
 * Protected: only works in development or with a debug query param.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface CheckResult {
  readonly status: "ok" | "error";
  readonly message: string;
  readonly latencyMs: number;
}

async function checkSupabaseAnon(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
      return { status: "error", message: "Missing SUPABASE_URL or ANON_KEY", latencyMs: 0 };
    }
    const client = createClient(url, key);
    const { error } = await client.from("agencies").select("id").limit(1);
    if (error) {
      return { status: "error", message: `Query failed: ${error.message}`, latencyMs: Date.now() - start };
    }
    return { status: "ok", message: "Connected", latencyMs: Date.now() - start };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown", latencyMs: Date.now() - start };
  }
}

async function checkSupabaseAdmin(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      return { status: "error", message: "Missing SUPABASE_URL or SERVICE_ROLE_KEY", latencyMs: 0 };
    }
    const client = createClient(url, key);
    const { data, error } = await client
      .from("api_token_costs")
      .select("endpoint, cost_per_request")
      .eq("is_active", true);
    if (error) {
      return { status: "error", message: `Query failed: ${error.message}`, latencyMs: Date.now() - start };
    }
    const endpoints = (data ?? []).map((d: { endpoint: string }) => d.endpoint);
    return { status: "ok", message: `Endpoints: ${endpoints.join(", ")}`, latencyMs: Date.now() - start };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown", latencyMs: Date.now() - start };
  }
}

async function checkAnthropic(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const key = process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) {
      return { status: "error", message: "Missing ANTHROPIC_API_KEY", latencyMs: 0 };
    }
    // Lightweight ping: just check auth with a minimal request
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      return { status: "error", message: `HTTP ${response.status}: ${body.slice(0, 200)}`, latencyMs: Date.now() - start };
    }
    return { status: "ok", message: "API key valid", latencyMs: Date.now() - start };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown", latencyMs: Date.now() - start };
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      return { status: "error", message: "Missing OPENAI_API_KEY (optional)", latencyMs: 0 };
    }
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        input: "health check",
        model: "text-embedding-3-small",
        dimensions: 1536,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      return { status: "error", message: `HTTP ${response.status}: ${body.slice(0, 200)}`, latencyMs: Date.now() - start };
    }
    return { status: "ok", message: "API key valid", latencyMs: Date.now() - start };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Unknown", latencyMs: Date.now() - start };
  }
}

export async function GET(request: NextRequest) {
  // Only allow in dev or with debug param
  const isDevOrDebug =
    process.env.NODE_ENV !== "production" ||
    request.nextUrl.searchParams.get("debug") === "1";

  if (!isDevOrDebug) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const [supabaseAnon, supabaseAdmin, anthropic, openai] = await Promise.all([
    checkSupabaseAnon(),
    checkSupabaseAdmin(),
    checkAnthropic(),
    checkOpenAI(),
  ]);

  const allOk = [supabaseAnon, supabaseAdmin, anthropic].every((c) => c.status === "ok");

  return NextResponse.json({
    overall: allOk ? "healthy" : "unhealthy",
    checks: {
      supabase_anon: supabaseAnon,
      supabase_admin: supabaseAdmin,
      anthropic,
      openai,
    },
    env_vars_present: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY?.trim(),
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY?.trim(),
      EXA_API_KEY: !!process.env.EXA_API_KEY?.trim(),
    },
  });
}
