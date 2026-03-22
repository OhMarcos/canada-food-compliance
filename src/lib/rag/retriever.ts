/**
 * Hybrid retriever combining structured DB queries and vector similarity search.
 * Uses Reciprocal Rank Fusion (RRF) to merge results from both sources.
 * Supports query expansion for bilingual (EN/KO) search.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSupabaseClient } from "@/lib/db/client";
import { generateEmbedding } from "./embedder";
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
  readonly source: "structured" | "vector" | "fused";
}

interface StructuredSearchParams {
  readonly query: string;
  readonly topics?: readonly string[];
  readonly applies_to?: readonly string[];
  readonly limit?: number;
}

interface VectorSearchParams {
  readonly query: string;
  readonly limit?: number;
  readonly similarity_threshold?: number;
}

interface RetrieveOptions {
  readonly topics?: readonly string[];
  readonly applies_to?: readonly string[];
  readonly limit?: number;
  readonly useVectorSearch?: boolean;
  readonly useQueryExpansion?: boolean;
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
      regulations!inner (
        id,
        title_en,
        short_name,
        official_url
      )
    `)
    .textSearch("content_en", params.query.split(" ").join(" & "), {
      type: "websearch",
    })
    .limit(limit);

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
 * Vector similarity search using pgvector
 */
async function vectorSearch(
  params: VectorSearchParams,
): Promise<readonly RetrievedContext[]> {
  const supabase = getSupabaseClient();
  const limit = params.limit ?? 10;
  const threshold = params.similarity_threshold ?? 0.5;

  const { embedding } = await generateEmbedding(params.query);

  const { data, error } = await supabase.rpc("match_regulation_chunks", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
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
    }),
    useVector
      ? vectorSearch({ query, limit: limit * 2 })
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
  ];
  return hashKey(keyParts.join("|"));
}

/**
 * Main hybrid retrieval function with caching and query expansion.
 * Combines structured search and vector search using RRF.
 * Optionally expands queries for bilingual search.
 */
export async function retrieveContext(
  query: string,
  options: RetrieveOptions = {},
): Promise<readonly RetrievedContext[]> {
  const limit = options.limit ?? 10;
  const useExpansion = options.useQueryExpansion ?? true;

  // Check cache first
  const cacheKey = buildCacheKey(query, options);
  const cached = retrievalCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let results: readonly RetrievedContext[];

  if (useExpansion) {
    results = await retrieveWithExpansion(query, options, limit);
  } else {
    results = await hybridSearchForQuery(query, options);
  }

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
