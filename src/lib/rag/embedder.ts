/**
 * Embedding generation for regulation text chunks.
 * Uses OpenAI text-embedding-3-small for vector generation.
 * Includes in-memory caching to avoid redundant API calls.
 */

import { TimeBasedCache, hashKey } from "@/lib/cache";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSION = 1536;

const embeddingCache = new TimeBasedCache<EmbeddingResult>({
  maxEntries: 50,
  ttlMs: 30 * 60 * 1000, // 30 minutes
});

export interface EmbeddingResult {
  readonly embedding: readonly number[];
  readonly model: string;
  readonly tokens_used: number;
}

export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const cacheKey = `emb_${hashKey(text)}`;
  const cached = embeddingCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for embedding generation");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSION,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    console.error("OpenAI embedding error:", response.status, rawError);
    throw new Error(`Embedding generation failed (status ${response.status})`);
  }

  const data = await response.json();

  const result: EmbeddingResult = {
    embedding: data.data[0].embedding,
    model: EMBEDDING_MODEL,
    tokens_used: data.usage.total_tokens,
  };

  embeddingCache.set(cacheKey, result);
  return result;
}

export async function generateEmbeddings(
  texts: readonly string[],
): Promise<readonly EmbeddingResult[]> {
  // Check cache for each text, only request uncached ones
  const results: (EmbeddingResult | null)[] = texts.map((text) => {
    const cacheKey = `emb_${hashKey(text)}`;
    return embeddingCache.get(cacheKey) ?? null;
  });

  const uncachedIndices = results
    .map((r, i) => (r === null ? i : -1))
    .filter((i) => i >= 0);

  if (uncachedIndices.length === 0) {
    return results as readonly EmbeddingResult[];
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for embedding generation");
  }

  const uncachedTexts = uncachedIndices.map((i) => texts[i]);

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: uncachedTexts,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSION,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    console.error("OpenAI embedding batch error:", response.status, rawError);
    throw new Error(`Embedding batch generation failed (status ${response.status})`);
  }

  const data = await response.json();

  // Map results back and cache them
  for (let j = 0; j < uncachedIndices.length; j++) {
    const originalIndex = uncachedIndices[j];
    const embeddingData = data.data[j];
    const result: EmbeddingResult = {
      embedding: embeddingData.embedding,
      model: EMBEDDING_MODEL,
      tokens_used: data.usage.total_tokens,
    };
    results[originalIndex] = result;

    // Cache individual results
    const cacheKey = `emb_${hashKey(texts[originalIndex])}`;
    embeddingCache.set(cacheKey, result);
  }

  return results as readonly EmbeddingResult[];
}
