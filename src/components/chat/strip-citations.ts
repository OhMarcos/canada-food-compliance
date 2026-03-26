/**
 * Client-side utility to strip citation JSON blocks from streamed text.
 * Prevents raw JSON from appearing during streaming before metadata arrives.
 */

const CITATION_PATTERNS: readonly RegExp[] = [
  /```json\s*\{[\s\S]*?"citations"[\s\S]*?\}\s*```/g,
  /\{\s*"citations"\s*:\s*\[[\s\S]*?\]\s*\}/g,
];

export function stripCitationJson(text: string): string {
  let cleaned = text;
  for (const pattern of CITATION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}
