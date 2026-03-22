import { z } from "zod";

// ============================================
// Extracted Product Info (from label images)
// ============================================
export const ExtractedProductInfoSchema = z.object({
  product_name: z.string(),
  product_name_translated: z.string(),
  original_language: z.string(),
  product_category: z.string(),
  manufacturer: z.string(),
  origin_country: z.string(),
  net_weight: z.string(),
  ingredients: z.array(z.string()),
  ingredients_translated: z.array(z.string()),
  allergens: z.array(z.string()),
  nutrition_facts: z.object({
    serving_size: z.string().optional(),
    calories: z.string().optional(),
    total_fat: z.string().optional(),
    sodium: z.string().optional(),
    total_carbohydrate: z.string().optional(),
    protein: z.string().optional(),
    other_nutrients: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).optional(),
  }).optional(),
  health_claims: z.array(z.string()),
  certifications: z.array(z.string()),
  storage_instructions: z.string().optional(),
  additional_notes: z.string().optional(),
});

export type ExtractedProductInfo = Readonly<z.infer<typeof ExtractedProductInfoSchema>>;

// ============================================
// Compliance Item
// ============================================
export const ComplianceItemSchema = z.object({
  category: z.enum([
    "licensing",
    "labelling",
    "allergens",
    "additives",
    "nutrition",
    "safety",
    "packaging",
    "claims",
    "certification",
    "other",
  ]),
  requirement: z.string(),
  status: z.enum(["pass", "fail", "needs_action", "unknown"]),
  regulation_reference: z.string(),
  description: z.string(),
  action_required: z.string().optional(),
});

export type ComplianceItem = Readonly<z.infer<typeof ComplianceItemSchema>>;

// ============================================
// Compliance Report
// ============================================
export const ComplianceReportSchema = z.object({
  feasibility: z.enum(["likely", "conditional", "unlikely"]),
  summary: z.string(),
  items: z.array(ComplianceItemSchema),
  action_items: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    category: z.string(),
  })),
});

export type ComplianceReport = Readonly<z.infer<typeof ComplianceReportSchema>>;

// ============================================
// Product Check Result (full API response)
// ============================================
export const ProductCheckResultSchema = z.object({
  extracted_info: ExtractedProductInfoSchema,
  compliance_report: ComplianceReportSchema,
  regulation_references: z.array(z.object({
    regulation_name: z.string(),
    section_number: z.string(),
    official_url: z.string(),
  })),
  processing_time_ms: z.number(),
});

export type ProductCheckResult = Readonly<z.infer<typeof ProductCheckResultSchema>>;
