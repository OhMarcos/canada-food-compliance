import { z } from "zod";

// ============================================
// Citation
// ============================================
export const CitationSchema = z.object({
  regulation_id: z.string().uuid(),
  section_id: z.string().uuid(),
  regulation_name: z.string(),
  section_number: z.string(),
  excerpt: z.string(),
  official_url: z.string(),
  relevance_score: z.number().min(0).max(1),
});

export type Citation = Readonly<z.infer<typeof CitationSchema>>;

// ============================================
// Chat Message
// ============================================
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  citations: z.array(CitationSchema).optional(),
  verification: z.object({
    status: z.enum(["pending", "verified", "failed", "partial"]),
    confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED"]),
    notes: z.string().optional(),
    verified_citations: z.array(z.string().uuid()).optional(),
    flagged_citations: z.array(z.string().uuid()).optional(),
  }).optional(),
  market_check: z.object({
    similar_products: z.array(z.object({
      name: z.string(),
      brand: z.string().optional(),
      retailer: z.string().optional(),
      url: z.string().optional(),
    })),
    recall_history: z.array(z.object({
      product: z.string(),
      reason: z.string(),
      date: z.string(),
    })),
  }).optional(),
  timestamp: z.string(),
});

export type ChatMessage = Readonly<z.infer<typeof ChatMessageSchema>>;

// ============================================
// Chat Request / Response
// ============================================
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  language: z.enum(["ko", "en"]).default("ko"),
  product_context: z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    origin_country: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
  }).optional(),
  include_market_check: z.boolean().default(true),
  conversation_id: z.string().uuid().optional(),
});

export type ChatRequest = Readonly<z.infer<typeof ChatRequestSchema>>;

export const ChatResponseSchema = z.object({
  message: ChatMessageSchema,
  conversation_id: z.string().uuid(),
  processing_time_ms: z.number(),
});

export type ChatResponse = Readonly<z.infer<typeof ChatResponseSchema>>;
