import { z } from "zod";

// ============================================
// Agency
// ============================================
export const AgencySchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_ko: z.string(),
  acronym: z.string(),
  website_url: z.string().url(),
  jurisdiction: z.enum(["federal", "provincial", "international"]),
  description_en: z.string().nullable(),
  description_ko: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Agency = Readonly<z.infer<typeof AgencySchema>>;

// ============================================
// Regulation
// ============================================
export const RegulationSchema = z.object({
  id: z.string().uuid(),
  agency_id: z.string().uuid(),
  title_en: z.string(),
  title_ko: z.string().nullable(),
  short_name: z.string(),
  statute_type: z.enum(["act", "regulation", "policy", "guideline", "standard"]),
  official_url: z.string().url(),
  gazette_citation: z.string().nullable(),
  effective_date: z.string().nullable(),
  last_amended: z.string().nullable(),
  is_active: z.boolean(),
  applies_to: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Regulation = Readonly<z.infer<typeof RegulationSchema>>;

// ============================================
// Regulation Section
// ============================================
export const RegulationSectionSchema = z.object({
  id: z.string().uuid(),
  regulation_id: z.string().uuid(),
  parent_section_id: z.string().uuid().nullable(),
  section_number: z.string(),
  title_en: z.string(),
  title_ko: z.string().nullable(),
  content_en: z.string(),
  content_ko: z.string().nullable(),
  section_url: z.string().nullable(),
  topics: z.array(z.string()),
  applies_to: z.array(z.string()),
  depth_level: z.number(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RegulationSection = Readonly<z.infer<typeof RegulationSectionSchema>>;

// ============================================
// Regulation Chunk (for RAG)
// ============================================
export const RegulationChunkSchema = z.object({
  id: z.string().uuid(),
  section_id: z.string().uuid(),
  chunk_text: z.string(),
  chunk_index: z.number(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string(),
});

export type RegulationChunk = Readonly<z.infer<typeof RegulationChunkSchema>>;

// ============================================
// Regulation with relations
// ============================================
export const RegulationWithAgencySchema = RegulationSchema.extend({
  agency: AgencySchema.optional(),
});

export type RegulationWithAgency = Readonly<z.infer<typeof RegulationWithAgencySchema>>;

export const SectionWithRegulationSchema = RegulationSectionSchema.extend({
  regulation: RegulationSchema.optional(),
});

export type SectionWithRegulation = Readonly<z.infer<typeof SectionWithRegulationSchema>>;
