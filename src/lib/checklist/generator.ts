/**
 * Compliance checklist generator.
 * Generates checklists based on product category and activity type.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSupabaseClient } from "@/lib/db/client";

const MODEL = "claude-sonnet-4-20250514";

export interface ChecklistResult {
  readonly template_name: string;
  readonly items: readonly ChecklistItemResult[];
  readonly is_verified: boolean;
  readonly source: "template" | "generated";
}

export interface ChecklistItemResult {
  readonly order: number;
  readonly requirement_en: string;
  readonly requirement_ko: string;
  readonly regulation_reference: string;
  readonly is_mandatory: boolean;
  readonly verification_method: string;
}

/**
 * Get existing checklist template from database
 */
async function getExistingTemplate(
  productCategory: string,
  activityType: string,
): Promise<ChecklistResult | null> {
  const supabase = getSupabaseClient();

  const { data: template } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("product_category", productCategory)
    .eq("activity_type", activityType)
    .single();

  if (!template) return null;

  const { data: items } = await supabase
    .from("checklist_items")
    .select(`
      *,
      regulation_sections (
        section_number,
        regulations (short_name)
      )
    `)
    .eq("template_id", template.id)
    .order("order_index");

  return {
    template_name: template.name_en,
    items: (items ?? []).map((item: Record<string, unknown>) => {
      const section = item.regulation_sections as Record<string, unknown> | null;
      const reg = section?.regulations as Record<string, unknown> | null;
      return {
        order: item.order_index as number,
        requirement_en: item.requirement_en as string,
        requirement_ko: (item.requirement_ko as string) ?? "",
        regulation_reference: section
          ? `${reg?.short_name ?? ""} ${section.section_number}`
          : "",
        is_mandatory: item.is_mandatory as boolean,
        verification_method: (item.verification_method as string) ?? "",
      };
    }),
    is_verified: template.is_verified,
    source: "template",
  };
}

/**
 * Generate a checklist using Claude based on regulation knowledge
 */
async function generateChecklist(
  productCategory: string,
  activityType: string,
  originCountry: string,
): Promise<ChecklistResult> {
  const prompt = `Generate a comprehensive compliance checklist for the following scenario:
- Product Category: ${productCategory}
- Activity Type: ${activityType}
- Origin Country: ${originCountry}

Based on Canadian food regulations (SFCA, SFCR, FDA, FDR, CPLA), create a detailed checklist of all regulatory requirements.

Output as JSON array:
{
  "items": [
    {
      "order": 1,
      "requirement_en": "English requirement description",
      "requirement_ko": "한국어 요구사항 설명",
      "regulation_reference": "SFCR s.47",
      "is_mandatory": true,
      "verification_method": "How to verify compliance"
    }
  ]
}

Include ALL applicable requirements for: licensing, labelling, safety, traceability, documentation, inspection.`;

  const { text } = await generateText({
    model: anthropic(MODEL),
    system: `You are a Canadian food regulatory compliance expert. Generate accurate, comprehensive compliance checklists based on actual Canadian food laws. Always reference specific regulation sections.`,
    prompt,
    maxOutputTokens: 4000,
    temperature: 0.1,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        template_name: `${activityType} Checklist - ${productCategory}`,
        items: (parsed.items ?? []).map(
          (item: Record<string, unknown>, index: number) => ({
            order: item.order ?? index + 1,
            requirement_en: item.requirement_en ?? "",
            requirement_ko: item.requirement_ko ?? "",
            regulation_reference: item.regulation_reference ?? "",
            is_mandatory: item.is_mandatory ?? true,
            verification_method: item.verification_method ?? "",
          }),
        ),
        is_verified: false,
        source: "generated" as const,
      };
    } catch {
      // Parsing failed
    }
  }

  return {
    template_name: `${activityType} Checklist - ${productCategory}`,
    items: [],
    is_verified: false,
    source: "generated",
  };
}

/**
 * Get or generate a compliance checklist.
 * First checks for existing verified templates, then generates if needed.
 */
export async function getChecklist(
  productCategory: string,
  activityType: "production" | "import" | "export" | "labeling" | "general",
  originCountry: string = "KR",
): Promise<ChecklistResult> {
  // Try existing template first
  const existing = await getExistingTemplate(productCategory, activityType);
  if (existing) return existing;

  // Generate new checklist
  return generateChecklist(productCategory, activityType, originCountry);
}
