/**
 * Shared JSON extraction utility for LLM responses.
 * Handles markdown code fences and raw JSON embedded in prose.
 */

/**
 * Extract JSON string from LLM response that may include markdown code fences or prose.
 */
export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Try to find raw JSON object
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1);
  }
  return text;
}

/**
 * Safely parse JSON from LLM output. Returns null if parsing fails.
 */
export function safeParseJson(text: string): unknown | null {
  try {
    const jsonText = extractJson(text);
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}
