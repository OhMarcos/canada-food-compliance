import { z } from "zod";

// ============================================
// Market Product
// ============================================
export const MarketProductSchema = z.object({
  id: z.string().uuid(),
  product_name: z.string(),
  brand: z.string().nullable(),
  category: z.string(),
  subcategory: z.string().nullable(),
  origin_country: z.string().nullable(),
  retailer: z.string().nullable(),
  product_url: z.string().nullable(),
  din_npn: z.string().nullable(),
  ingredients: z.array(z.string()).nullable(),
  compliance_notes: z.string().nullable(),
  is_recalled: z.boolean(),
  recall_details: z.string().nullable(),
  last_verified: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MarketProduct = Readonly<z.infer<typeof MarketProductSchema>>;

// ============================================
// Market Search Request / Response
// ============================================
export const MarketSearchRequestSchema = z.object({
  product_name: z.string().min(1),
  category: z.string().optional(),
  origin_country: z.string().default("KR"),
  include_web_search: z.boolean().default(true),
});

export type MarketSearchRequest = Readonly<z.infer<typeof MarketSearchRequestSchema>>;

export const MarketSearchResultSchema = z.object({
  db_products: z.array(MarketProductSchema),
  web_products: z.array(z.object({
    name: z.string(),
    brand: z.string().optional(),
    retailer: z.string().optional(),
    url: z.string().optional(),
    snippet: z.string().optional(),
  })),
  recalls: z.array(z.object({
    product: z.string(),
    reason: z.string(),
    date: z.string(),
    url: z.string().optional(),
  })),
  total_similar: z.number(),
  search_time_ms: z.number(),
});

export type MarketSearchResult = Readonly<z.infer<typeof MarketSearchResultSchema>>;

// ============================================
// Checklist
// ============================================
export const ChecklistTemplateSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_ko: z.string().nullable(),
  description_en: z.string().nullable(),
  description_ko: z.string().nullable(),
  product_category: z.string(),
  activity_type: z.enum(["production", "import", "export", "labeling", "general"]),
  import_origin: z.string(),
  is_verified: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ChecklistTemplate = Readonly<z.infer<typeof ChecklistTemplateSchema>>;

export const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  regulation_section_id: z.string().uuid().nullable(),
  order_index: z.number(),
  requirement_en: z.string(),
  requirement_ko: z.string().nullable(),
  description_en: z.string().nullable(),
  description_ko: z.string().nullable(),
  is_mandatory: z.boolean(),
  verification_method: z.string().nullable(),
  created_at: z.string(),
});

export type ChecklistItem = Readonly<z.infer<typeof ChecklistItemSchema>>;
