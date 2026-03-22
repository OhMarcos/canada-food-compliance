/**
 * Market cross-check service.
 * Searches for similar Korean food products already sold in Canada
 * to validate compliance precedent.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSupabaseClient } from "@/lib/db/client";
import { SYSTEM_PROMPT_MARKET_CHECK } from "@/lib/ai/prompts";
import { sanitizeUrl } from "@/lib/url";
import type { MarketSearchResult } from "@/types/market";

const MODEL = "claude-sonnet-4-20250514";

interface MarketSearchParams {
  readonly productName: string;
  readonly category?: string;
  readonly originCountry?: string;
  readonly includeWebSearch?: boolean;
}

/**
 * Search local database for similar products
 */
async function searchLocalDB(
  params: MarketSearchParams,
): Promise<
  readonly {
    readonly id: string;
    readonly product_name: string;
    readonly brand: string | null;
    readonly category: string;
    readonly retailer: string | null;
    readonly product_url: string | null;
    readonly is_recalled: boolean;
    readonly recall_details: string | null;
  }[]
> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from("market_products")
    .select("id, product_name, brand, category, retailer, product_url, is_recalled, recall_details")
    .limit(20);

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.originCountry) {
    query = query.eq("origin_country", params.originCountry);
  }

  // Text search on product name
  if (params.productName) {
    query = query.textSearch("product_name", params.productName, {
      type: "websearch",
    });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Market DB search error:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Use Claude to identify similar products (web knowledge)
 */
async function aiMarketSearch(
  params: MarketSearchParams,
): Promise<{
  readonly similar_products: readonly {
    readonly name: string;
    readonly brand?: string;
    readonly retailer?: string;
    readonly url?: string;
    readonly relevance?: string;
  }[];
  readonly compliance_notes: string;
  readonly recall_history: readonly {
    readonly product: string;
    readonly reason: string;
    readonly date: string;
  }[];
}> {
  // Sanitize user input to prevent prompt injection via quotes/newlines
  const safeName = params.productName.replace(/["\n\r`]/g, " ").trim().slice(0, 100);
  const safeCategory = (params.category ?? "food").replace(/["\n\r`]/g, " ").trim().slice(0, 50);
  const safeOrigin = (params.originCountry ?? "Korea").replace(/["\n\r`]/g, " ").trim().slice(0, 20);

  const prompt = `Find similar products to "${safeName}" (category: ${safeCategory}, origin: ${safeOrigin}) that are already sold in the Canadian market. Focus on Korean food products available at Canadian retailers like H-Mart, PAT Central, T&T Supermarket, Amazon.ca, Walmart.ca, Costco.ca. Also check for any CFIA food recalls related to this type of product.`;

  try {
    const { text } = await generateText({
      model: anthropic(MODEL),
      system: SYSTEM_PROMPT_MARKET_CHECK,
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.3,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        similar_products: parsed.similar_products ?? [],
        compliance_notes: parsed.compliance_notes ?? "",
        recall_history: parsed.recall_history ?? [],
      };
    }
  } catch (error) {
    console.error("AI market search error:", error);
  }

  return {
    similar_products: [],
    compliance_notes: "",
    recall_history: [],
  };
}

/**
 * Full market cross-check: local DB + AI knowledge
 */
export async function marketCrossCheck(
  params: MarketSearchParams,
): Promise<MarketSearchResult> {
  const startTime = Date.now();

  // Run both searches in parallel
  const [dbResults, aiResults] = await Promise.all([
    searchLocalDB(params),
    params.includeWebSearch !== false
      ? aiMarketSearch(params)
      : Promise.resolve({
          similar_products: [] as readonly { name: string; brand?: string; retailer?: string; url?: string; relevance?: string }[],
          compliance_notes: "",
          recall_history: [] as readonly { product: string; reason: string; date: string }[],
        }),
  ]);

  // Map DB results to the expected format
  const dbProducts = dbResults.map((p) => ({
    id: p.id,
    product_name: p.product_name,
    brand: p.brand,
    category: p.category,
    subcategory: null,
    origin_country: params.originCountry ?? "KR",
    retailer: p.retailer,
    product_url: p.product_url,
    din_npn: null,
    ingredients: null,
    compliance_notes: null,
    is_recalled: p.is_recalled,
    recall_details: p.recall_details,
    last_verified: null,
    created_at: "",
    updated_at: "",
  }));

  return {
    db_products: dbProducts,
    web_products: aiResults.similar_products.map((p) => ({
      name: p.name,
      brand: p.brand,
      retailer: p.retailer,
      url: sanitizeUrl(p.url),
      snippet: p.relevance,
    })),
    recalls: aiResults.recall_history.map((r) => ({
      product: r.product,
      reason: r.reason,
      date: r.date,
    })),
    total_similar: dbResults.length + aiResults.similar_products.length,
    search_time_ms: Date.now() - startTime,
  };
}
