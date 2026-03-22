/**
 * Claude Vision-based product label analyzer.
 * Extracts and translates all product information from label images.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT_EXTRACT } from "./product-check-prompts";
import { safeParseJson } from "./json-parser";
import { ExtractedProductInfoSchema, type ExtractedProductInfo } from "@/types/product-check";

const MODEL = "claude-sonnet-4-20250514";

interface ImageInput {
  readonly data: string;
  readonly mimeType: string;
}

const EXTRACTION_DEFAULTS: ExtractedProductInfo = {
  product_name: "Unknown",
  product_name_translated: "Unknown",
  original_language: "unknown",
  product_category: "unknown",
  manufacturer: "Unknown",
  origin_country: "Unknown",
  net_weight: "",
  ingredients: [],
  ingredients_translated: [],
  allergens: [],
  health_claims: [],
  certifications: [],
};

/**
 * Analyze product label images and extract structured product information.
 * Uses Claude's vision capability to read labels in any language.
 */
export async function extractProductInfo(
  images: readonly ImageInput[],
): Promise<ExtractedProductInfo> {
  const imageContent = images.map((img) => ({
    type: "image" as const,
    image: img.data,
    mimeType: img.mimeType,
  }));

  const { text } = await generateText({
    model: anthropic(MODEL),
    system: SYSTEM_PROMPT_EXTRACT,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text" as const,
            text: "Analyze these product label images and extract all information. Return ONLY valid JSON.",
          },
        ],
      },
    ],
    maxOutputTokens: 4000,
    temperature: 0.1,
  });

  const parsed = safeParseJson(text);
  if (parsed === null) {
    return EXTRACTION_DEFAULTS;
  }

  const result = ExtractedProductInfoSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  // Fill defaults for missing fields
  const raw = parsed as Record<string, unknown>;
  const withDefaults = {
    product_name: raw.product_name ?? "Unknown",
    product_name_translated: raw.product_name_translated ?? raw.product_name ?? "Unknown",
    original_language: raw.original_language ?? "unknown",
    product_category: raw.product_category ?? "unknown",
    manufacturer: raw.manufacturer ?? "Unknown",
    origin_country: raw.origin_country ?? "Unknown",
    net_weight: raw.net_weight ?? "",
    ingredients: raw.ingredients ?? [],
    ingredients_translated: raw.ingredients_translated ?? raw.ingredients ?? [],
    allergens: raw.allergens ?? [],
    nutrition_facts: raw.nutrition_facts ?? undefined,
    health_claims: raw.health_claims ?? [],
    certifications: raw.certifications ?? [],
    storage_instructions: raw.storage_instructions ?? undefined,
    additional_notes: raw.additional_notes ?? undefined,
  };
  return ExtractedProductInfoSchema.parse(withDefaults);
}
