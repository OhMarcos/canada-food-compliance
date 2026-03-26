/**
 * Hybrid retriever combining structured DB queries, vector similarity search,
 * and on-demand web fetching from government regulation websites.
 * Uses Reciprocal Rank Fusion (RRF) to merge results from all sources.
 * Supports query expansion for bilingual (EN/KO) search.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSupabaseClient } from "@/lib/db/client";
import { generateEmbedding } from "./embedder";
import { routeQuery } from "./regulation-router";
import { fetchAndExtract, fetchRegulationWithSubpages } from "./web-fetcher";
import { classifyDomain, type ProductDomain } from "./domain-classifier";
import { TimeBasedCache, hashKey } from "@/lib/cache";

export interface RetrievedContext {
  readonly section_id: string;
  readonly regulation_id: string;
  readonly regulation_name: string;
  readonly regulation_short_name: string;
  readonly section_number: string;
  readonly title: string;
  readonly content: string;
  readonly official_url: string;
  readonly section_url: string | null;
  readonly topics: readonly string[];
  readonly score: number;
  readonly source: "structured" | "vector" | "fused" | "web";
  readonly product_domain?: ProductDomain;
}

interface StructuredSearchParams {
  readonly query: string;
  readonly topics?: readonly string[];
  readonly applies_to?: readonly string[];
  readonly limit?: number;
  readonly productDomain?: ProductDomain;
}

interface VectorSearchParams {
  readonly query: string;
  readonly limit?: number;
  readonly similarity_threshold?: number;
  readonly productDomain?: ProductDomain;
}

interface RetrieveOptions {
  readonly topics?: readonly string[];
  readonly applies_to?: readonly string[];
  readonly limit?: number;
  readonly useVectorSearch?: boolean;
  readonly useQueryExpansion?: boolean;
  readonly productDomain?: ProductDomain;
}

const RRF_K = 60; // RRF constant
const EXPANSION_MODEL = "claude-sonnet-4-20250514";

/** Cache for retrieval results, keyed by query hash */
const retrievalCache = new TimeBasedCache<readonly RetrievedContext[]>({
  ttlMs: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
});

/**
 * Structured search using full-text search and topic filtering
 */
async function structuredSearch(
  params: StructuredSearchParams,
): Promise<readonly RetrievedContext[]> {
  const supabase = getSupabaseClient();
  const limit = params.limit ?? 10;

  let query = supabase
    .from("regulation_sections")
    .select(`
      id,
      regulation_id,
      section_number,
      title_en,
      content_en,
      section_url,
      topics,
      product_domain,
      regulations!inner (
        id,
        title_en,
        short_name,
        official_url,
        product_domain
      )
    `)
    .textSearch("content_en", params.query.split(" ").join(" & "), {
      type: "websearch",
    })
    .limit(limit);

  // Filter by product domain when specified
  if (params.productDomain && params.productDomain !== "both") {
    query = query.or(`product_domain.eq.${params.productDomain},product_domain.eq.both`, { referencedTable: "regulations" });
  }

  if (params.topics && params.topics.length > 0) {
    query = query.overlaps("topics", [...params.topics]);
  }

  if (params.applies_to && params.applies_to.length > 0) {
    query = query.overlaps("applies_to", [...params.applies_to]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Structured search error:", error);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>, index: number) => {
    const reg = row.regulations as Record<string, unknown>;
    return {
      section_id: row.id as string,
      regulation_id: reg.id as string,
      regulation_name: reg.title_en as string,
      regulation_short_name: reg.short_name as string,
      section_number: row.section_number as string,
      title: row.title_en as string,
      content: row.content_en as string,
      official_url: reg.official_url as string,
      section_url: row.section_url as string | null,
      topics: row.topics as string[],
      score: 1 - index / (data?.length ?? 1),
      source: "structured" as const,
    };
  });
}

/**
 * Check whether OpenAI embeddings are available.
 * Returns false when the key is missing so callers can skip vector search.
 */
function isEmbeddingAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

/**
 * Vector similarity search using pgvector.
 * Gracefully returns [] when embeddings are unavailable (missing or failed API key).
 */
async function vectorSearch(
  params: VectorSearchParams,
): Promise<readonly RetrievedContext[]> {
  if (!isEmbeddingAvailable()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    const limit = params.limit ?? 10;
    const threshold = params.similarity_threshold ?? 0.5;

    const { embedding } = await generateEmbedding(params.query);

    const { data, error } = await supabase.rpc("match_regulation_chunks", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      domain_filter: params.productDomain === "both" ? null : (params.productDomain ?? null),
    });

    if (error) {
      console.error("Vector search error:", error);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      section_id: row.section_id as string,
      regulation_id: row.regulation_id as string,
      regulation_name: row.regulation_name as string,
      regulation_short_name: row.regulation_short_name as string,
      section_number: row.section_number as string,
      title: row.title as string,
      content: row.content as string,
      official_url: row.official_url as string,
      section_url: row.section_url as string | null,
      topics: row.topics as string[],
      score: row.similarity as number,
      source: "vector" as const,
    }));
  } catch (error) {
    console.warn("Vector search failed, falling back to structured search only:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Reciprocal Rank Fusion to merge multiple result lists.
 * Supports merging any number of ranked result lists.
 */
function reciprocalRankFusion(
  resultLists: readonly (readonly RetrievedContext[])[],
  limit: number,
): readonly RetrievedContext[] {
  const scoreMap = new Map<string, { context: RetrievedContext; score: number; sources: number }>();

  for (const results of resultLists) {
    for (let rank = 0; rank < results.length; rank++) {
      const ctx = results[rank];
      const key = ctx.section_id;
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = scoreMap.get(key);
      if (existing) {
        scoreMap.set(key, {
          context: { ...existing.context, source: "fused" },
          score: existing.score + rrfScore,
          sources: existing.sources + 1,
        });
      } else {
        scoreMap.set(key, { context: ctx, score: rrfScore, sources: 1 });
      }
    }
  }

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ context, score }) => ({ ...context, score }));
}

/**
 * Generate query variations using a lightweight Claude prompt.
 * Produces English + Korean search variations for bilingual retrieval.
 */
async function expandQuery(query: string): Promise<readonly string[]> {
  try {
    const { text } = await generateText({
      model: anthropic(EXPANSION_MODEL),
      system: `You are a search query expansion assistant for Canadian food regulations.
Given a user query, generate 2-3 alternative search phrasings.
Include both English and Korean variations to support bilingual retrieval.
Output ONLY a JSON array of strings, nothing else.
Example: ["food labeling requirements Canada", "Canadian nutrition facts label rules", "캐나다 식품 라벨링 요건"]`,
      prompt: query,
      maxOutputTokens: 300,
      temperature: 0.3,
    });

    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item: unknown): item is string => typeof item === "string")
        .slice(0, 3);
    }
  } catch (error) {
    console.error("Query expansion failed, using original query:", error);
  }

  return [];
}

/**
 * Run a single hybrid search (structured + vector) for one query.
 */
async function hybridSearchForQuery(
  query: string,
  options: RetrieveOptions,
): Promise<readonly RetrievedContext[]> {
  const limit = options.limit ?? 10;
  const useVector = options.useVectorSearch ?? true;

  const [structuredResults, vectorResults] = await Promise.all([
    structuredSearch({
      query,
      topics: options.topics,
      applies_to: options.applies_to,
      limit: limit * 2,
      productDomain: options.productDomain,
    }),
    useVector
      ? vectorSearch({ query, limit: limit * 2, productDomain: options.productDomain })
      : Promise.resolve([] as readonly RetrievedContext[]),
  ]);

  if (!useVector || vectorResults.length === 0) {
    return structuredResults.slice(0, limit);
  }

  return reciprocalRankFusion([structuredResults, vectorResults], limit);
}

/**
 * Build a cache key from query + options.
 */
function buildCacheKey(query: string, options: RetrieveOptions): string {
  const keyParts = [
    query,
    options.topics?.join(",") ?? "",
    options.applies_to?.join(",") ?? "",
    String(options.limit ?? 10),
    String(options.useVectorSearch ?? true),
    String(options.useQueryExpansion ?? true),
    options.productDomain ?? "auto",
  ];
  return hashKey(keyParts.join("|"));
}

/**
 * On-demand web search: route query to relevant regulations,
 * fetch their official pages, and return as RetrievedContext.
 * Returns empty array on failure (never throws).
 */
async function webSearch(
  query: string,
  domain?: ProductDomain,
): Promise<readonly RetrievedContext[]> {
  try {
    console.log("[retriever] Triggering on-demand web fetch...");

    // Step 1: Route to relevant regulations
    const routes = await routeQuery(query);
    if (routes.length === 0) {
      console.log("[retriever] No relevant regulations identified by router");
      return [];
    }

    console.log(`[retriever] Router identified ${routes.length} regulation(s): ${routes.map((r) => r.short_name).join(", ")}`);

    // Step 2: Fetch regulation pages in parallel
    const fetchResults = await Promise.all(
      routes.map(async (route) => {
        console.log(`[retriever] Fetching: ${route.official_url}`);
        const isJusticeLaws = route.official_url.includes("laws-lois.justice.gc.ca");
        const content = isJusticeLaws
          ? await fetchRegulationWithSubpages(route.official_url, 2)
          : await fetchAndExtract(route.official_url);

        console.log(`[retriever] Fetched ${route.short_name}: ${content.length} chars`);
        return { route, content };
      }),
    );

    // Step 3: Convert to RetrievedContext format
    const results = fetchResults
      .filter(({ content }) => content.length > 100)
      .map(({ route, content }, index) => ({
        section_id: `web-${route.short_name}`,
        regulation_id: "",
        regulation_name: route.title_en,
        regulation_short_name: route.short_name,
        section_number: "Full text",
        title: route.title_en,
        content,
        official_url: route.official_url,
        section_url: null,
        topics: [] as string[],
        score: 0.6 - index * 0.05,
        source: "web" as const,
      }));

    console.log(`[retriever] Web fetch returned ${results.length} result(s)`);
    return results;
  } catch (error) {
    console.warn("[retriever] Web search failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Main hybrid retrieval function with caching, query expansion, and web fallback.
 * Combines structured search and vector search using RRF.
 * Falls back to on-demand web fetching when DB results are insufficient.
 */
export async function retrieveContext(
  query: string,
  options: RetrieveOptions = {},
): Promise<readonly RetrievedContext[]> {
  const limit = options.limit ?? 10;
  const useExpansion = options.useQueryExpansion ?? true;

  // Auto-classify domain if not explicitly provided
  const domainClassification = options.productDomain
    ? { domain: options.productDomain, confidence: "high" as const, reason: "explicit" }
    : await classifyDomain(query);
  const resolvedOptions = { ...options, productDomain: domainClassification.domain };

  console.log(`[retriever] Domain: ${domainClassification.domain} (${domainClassification.confidence})`);

  // Check cache first
  const cacheKey = buildCacheKey(query, resolvedOptions);
  const cached = retrievalCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Run DB search and web fetch in parallel for best coverage.
  const dbSearchPromise = useExpansion
    ? retrieveWithExpansion(query, resolvedOptions, limit)
    : hybridSearchForQuery(query, resolvedOptions);

  const [dbResults, webResults] = await Promise.all([
    dbSearchPromise,
    webSearch(query, domainClassification.domain),
  ]);

  console.log(`[retriever] DB results: ${dbResults.length}, Web results: ${webResults.length}`);

  // Merge: guarantee web results are included by reserving slots.
  // Take up to (limit - webSlots) from DB, then all web results, then fill remaining from DB.
  const webSlots = Math.min(webResults.length, Math.max(3, Math.floor(limit / 2)));
  const dbSlots = limit - webSlots;
  const dbPrimary = dbResults.slice(0, dbSlots);
  const dbRemaining = dbResults.slice(dbSlots);
  const webPrimary = webResults.slice(0, webSlots);
  const results = [...dbPrimary, ...webPrimary, ...dbRemaining].slice(0, limit);

  // Store in cache
  retrievalCache.set(cacheKey, results);
  return results;
}

/**
 * Retrieve with query expansion: expand the query, run parallel searches,
 * then merge all results using RRF.
 */
async function retrieveWithExpansion(
  query: string,
  options: RetrieveOptions,
  limit: number,
): Promise<readonly RetrievedContext[]> {
  // Generate expanded queries in parallel with the original search
  const [originalResults, expandedQueries] = await Promise.all([
    hybridSearchForQuery(query, { ...options, useQueryExpansion: false }),
    expandQuery(query),
  ]);

  // If expansion produced no variations, return original results
  if (expandedQueries.length === 0) {
    return originalResults;
  }

  // Run expanded queries in parallel
  const expandedResults = await Promise.all(
    expandedQueries.map((expandedQuery) =>
      hybridSearchForQuery(expandedQuery, {
        ...options,
        useQueryExpansion: false,
      }),
    ),
  );

  // Merge all result lists using RRF
  const allResultLists = [originalResults, ...expandedResults];
  return reciprocalRankFusion(allResultLists, limit);
}

/**
 * Direct section lookup by ID (for verification)
 */
export async function getSectionById(
  sectionId: string,
): Promise<RetrievedContext | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("regulation_sections")
    .select(`
      id,
      regulation_id,
      section_number,
      title_en,
      content_en,
      section_url,
      topics,
      regulations!inner (
        id,
        title_en,
        short_name,
        official_url
      )
    `)
    .eq("id", sectionId)
    .single();

  if (error || !data) return null;

  const reg = data.regulations as unknown as Record<string, unknown>;
  return {
    section_id: data.id,
    regulation_id: reg.id as string,
    regulation_name: reg.title_en as string,
    regulation_short_name: reg.short_name as string,
    section_number: data.section_number,
    title: data.title_en,
    content: data.content_en,
    official_url: reg.official_url as string,
    section_url: data.section_url,
    topics: data.topics,
    score: 1,
    source: "structured",
  };
}

/** Export cache for testing/monitoring purposes */
export { retrievalCache };
