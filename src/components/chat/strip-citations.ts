/**
 * Client-side utility to strip citation JSON blocks from streamed text.
 * Prevents raw JSON from appearing during streaming before metadata arrives.
 *
 * The LLM appends citation JSON at the end of the answer. We use a
 * bracket-counting approach to correctly handle nested objects/arrays,
 * which simple regex cannot do reliably.
 */

/**
 * Find the start of a citation JSON block in the text.
 * Looks for `"citations"` preceded by `{` (with optional whitespace).
 */
function findCitationStart(text: string): number {
  // Fenced block: ```json ... ```
  const fencedIdx = text.indexOf("```json");
  if (fencedIdx !== -1) {
    const afterFence = text.slice(fencedIdx);
    if (afterFence.includes('"citations"')) return fencedIdx;
  }

  // Bare JSON: { "citations": [
  const citIdx = text.indexOf('"citations"');
  if (citIdx === -1) return -1;

  // Walk backward to find the opening `{`
  for (let i = citIdx - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === "{") return i;
    if (ch !== " " && ch !== "\n" && ch !== "\r" && ch !== "\t") break;
  }

  // No opening brace found — treat `"citations": [` as the start
  return citIdx;
}

/**
 * Find the matching closing brace/bracket using bracket counting.
 * Returns the index AFTER the closing character, or -1 if unmatanced.
 */
function findMatchingClose(text: string, startIdx: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) {
        // Skip trailing ``` if fenced
        let end = i + 1;
        const remaining = text.slice(end).trimStart();
        if (remaining.startsWith("```")) {
          end = text.indexOf("```", end) + 3;
        }
        return end;
      }
    }
  }
  return -1;
}

export function stripCitationJson(text: string): string {
  const start = findCitationStart(text);
  if (start === -1) return text;

  const end = findMatchingClose(text, start);
  if (end === -1) {
    // Incomplete JSON (still streaming) — strip from start to end of text
    return text.slice(0, start).replace(/\n{3,}/g, "\n\n").trim();
  }

  const cleaned = text.slice(0, start) + text.slice(end);
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}
