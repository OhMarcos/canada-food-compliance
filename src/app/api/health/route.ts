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

/**
 * Test the full chat pipeline (RAG retrieval + LLM) without auth.
 * Only available with debug param.
 */
async function checkChatPipeline(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Step 1: Test RAG retrieval (structured search)
    const { getSupabaseClient } = await import("@/lib/db/client");
    const supabase = getSupabaseClient();
    const { data: sections, error: searchError } = await supabase
      .from("regulation_sections")
      .select("id, section_number, title_en, content_en")
      .textSearch("content_en", "food & labeling", { type: "websearch" })
      .limit(3);

    if (searchError) {
      return { status: "error", message: `RAG search failed: ${searchError.message}`, latencyMs: Date.now() - start };
    }

    if (!sections || sections.length === 0) {
      return { status: "error", message: "RAG search returned 0 results — regulation_sections may be empty", latencyMs: Date.now() - start };
    }

    // Step 2: Test LLM call via Vercel AI SDK
    const { generateText } = await import("ai");
    const { anthropic } = await import("@ai-sdk/anthropic");
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: "Reply with exactly: OK",
      maxOutputTokens: 10,
      temperature: 0,
    });

    if (!text.includes("OK")) {
      return { status: "error", message: `LLM responded but unexpected: ${text.slice(0, 100)}`, latencyMs: Date.now() - start };
    }

    return {
      status: "ok",
      message: `RAG: ${sections.length} results, LLM: OK`,
      latencyMs: Date.now() - start,
    };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? `${e.name}: ${e.message}` : "Unknown", latencyMs: Date.now() - start };
  }
}

/**
 * Test the web fetch pipeline: regulation routing + government page fetch.
 */
async function checkWebPipeline(): Promise<CheckResult & { details?: Record<string, unknown> }> {
  const start = Date.now();
  try {
    // Step 1: Load regulations from DB
    const { getSupabaseClient } = await import("@/lib/db/client");
    const supabase = getSupabaseClient();
    const { data: regs, error: regError } = await supabase
      .from("regulations")
      .select("short_name, title_en, official_url, applies_to, statute_type")
      .eq("is_active", true);

    if (regError || !regs || regs.length === 0) {
      return {
        status: "error",
        message: `Failed to load regulations: ${regError?.message ?? "no data"}`,
        latencyMs: Date.now() - start,
        details: { step: "load_regulations" },
      };
    }

    // Step 2: Test raw HTTP fetch to government sites (diagnose if Vercel can reach them)
    const testUrls = [
      "https://laws-lois.justice.gc.ca/eng/acts/S-0.4/",
      "https://inspection.canada.ca/about-cfia/acts-and-regulations/list-of-acts-and-regulations/eng/1419029096537/1419029097256",
    ];
    const rawFetches = await Promise.all(
      testUrls.map(async (url) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const resp = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "OHMAZE/1.0 (Canadian food compliance research tool)",
              Accept: "text/html",
            },
            redirect: "follow",
          });
          clearTimeout(timeout);
          const body = await resp.text();
          return { url, status: resp.status, bodyLen: body.length, redirected: resp.redirected, finalUrl: resp.url };
        } catch (e) {
          return { url, status: 0, bodyLen: 0, error: e instanceof Error ? e.message : "Unknown" };
        }
      }),
    );

    // Step 3: Test regulation router with a sample query
    const { routeQuery } = await import("@/lib/rag/regulation-router");
    const routes = await routeQuery("plant-based meat labeling Canada");

    // Step 4: Test web fetcher on a known URL
    const { fetchAndExtract } = await import("@/lib/rag/web-fetcher");
    const fetchUrl = routes.length > 0
      ? routes[0].official_url
      : regs[0].official_url;
    const content = await fetchAndExtract(fetchUrl as string);

    return {
      status: content.length > 100 ? "ok" : "error",
      message: `Regs: ${regs.length}, Routes: ${routes.length}, Fetched: ${content.length} chars`,
      latencyMs: Date.now() - start,
      details: {
        regulations_loaded: regs.length,
        regulation_names: regs.map((r: { short_name: string }) => r.short_name),
        regulation_urls: regs.map((r: { short_name: string; official_url: string }) => `${r.short_name}: ${r.official_url}`),
        raw_fetches: rawFetches,
        routes_found: routes.length,
        route_details: routes,
        fetched_url: fetchUrl,
        fetched_chars: content.length,
        fetched_preview: content.slice(0, 300),
      },
    };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? `${e.name}: ${e.message}` : "Unknown",
      latencyMs: Date.now() - start,
      details: { step: "exception" },
    };
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

  const deepCheck = request.nextUrl.searchParams.get("deep") === "1";

  const [supabaseAnon, supabaseAdmin, anthropic, openai] = await Promise.all([
    checkSupabaseAnon(),
    checkSupabaseAdmin(),
    checkAnthropic(),
    checkOpenAI(),
  ]);

  const pipeline = deepCheck ? await checkChatPipeline() : undefined;
  const webPipeline = deepCheck ? await checkWebPipeline() : undefined;

  const allOk = [supabaseAnon, supabaseAdmin, anthropic].every((c) => c.status === "ok");

  return NextResponse.json({
    overall: allOk ? "healthy" : "unhealthy",
    checks: {
      supabase_anon: supabaseAnon,
      supabase_admin: supabaseAdmin,
      anthropic,
      openai,
      ...(pipeline ? { chat_pipeline: pipeline } : {}),
      ...(webPipeline ? { web_pipeline: webPipeline } : {}),
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
