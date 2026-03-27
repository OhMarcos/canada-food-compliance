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

/**
 * Strip domain alert delimiters from streaming text.
 * Removes partial or complete ---DOMAIN_ALERT_START--- / ---DOMAIN_ALERT_END--- blocks.
 */
function stripDomainAlertClient(text: string): string {
  const startMarker = "---DOMAIN_ALERT_START---";
  const endMarker = "---DOMAIN_ALERT_END---";

  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) {
    // Check for partial marker at end (still streaming)
    const partial = "---DOMAIN_ALERT";
    const partialIdx = text.lastIndexOf(partial);
    if (partialIdx !== -1 && partialIdx > text.length - startMarker.length - 5) {
      return text.slice(0, partialIdx).replace(/\n{3,}/g, "\n\n").trim();
    }
    return text;
  }

  const endIdx = text.indexOf(endMarker);
  if (endIdx === -1) {
    // Incomplete block (still streaming) — strip from start marker to end
    return text.slice(0, startIdx).replace(/\n{3,}/g, "\n\n").trim();
  }

  return (text.slice(0, startIdx) + text.slice(endIdx + endMarker.length))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function stripCitationJson(text: string): string {
  // Strip domain alert first, then citations
  const withoutAlert = stripDomainAlertClient(text);

  const start = findCitationStart(withoutAlert);
  if (start === -1) return withoutAlert;

  const end = findMatchingClose(withoutAlert, start);
  if (end === -1) {
    // Incomplete JSON (still streaming) — strip from start to end of text
    return withoutAlert.slice(0, start).replace(/\n{3,}/g, "\n\n").trim();
  }

  const cleaned = withoutAlert.slice(0, start) + withoutAlert.slice(end);
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}
