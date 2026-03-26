/**
 * Claude-powered Q&A engine with citation enforcement.
 * Uses Vercel AI SDK for streaming responses.
 * Supports multi-turn conversation history.
 */

import { generateText, streamText } from "ai";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { anthropic } from "@ai-sdk/anthropic";
import { buildQAPrompt } from "./prompts";
import { retrieveContext, type RetrievedContext } from "@/lib/rag/retriever";
import { classifyDomain, type ProductDomain, type DomainClassification } from "@/lib/rag/domain-classifier";
import type { Citation } from "@/types/chat";

const MODEL = "claude-sonnet-4-20250514";
const MAX_HISTORY_TURNS = 3;

export interface ConversationTurn {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface QAOptions {
  readonly language?: "ko" | "en";
  readonly topics?: readonly string[];
  readonly applies_to?: readonly string[];
  readonly history?: readonly ConversationTurn[];
}

export interface QAResult {
  readonly answer: string;
  readonly rawAnswer: string;
  readonly citations: readonly Citation[];
  readonly contexts: readonly RetrievedContext[];
  readonly processingTimeMs: number;
  readonly domainClassification: DomainClassification;
}

/**
 * Build messages array including conversation history.
 * Only includes the last MAX_HISTORY_TURNS turns for context window efficiency.
 */
function buildMessages(
  question: string,
  history?: readonly ConversationTurn[],
): readonly ModelMessage[] {
  const messages: ModelMessage[] = [];

  if (history && history.length > 0) {
    // Take only the last N turns to keep context manageable
    const recentHistory = history.slice(-MAX_HISTORY_TURNS * 2);
    for (const turn of recentHistory) {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  messages.push({ role: "user", content: question });
  return messages;
}

/**
 * Regex patterns for extracting citation JSON blocks from LLM output.
 * Order matters: fenced blocks first, then bare JSON.
 */
const CITATION_JSON_PATTERNS: readonly RegExp[] = [
  // 1. Fenced code block: ```json { "citations": [...] } ```
  /```json\s*(\{[\s\S]*?"citations"[\s\S]*?\})\s*```/,
  // 2. Bare JSON object with "citations" key (no code fences)
  /(\{\s*"citations"\s*:\s*\[[\s\S]*?\]\s*\})/,
];

/**
 * Extract the raw citation JSON string from LLM output.
 * Returns the matched substring (for stripping) and parsed citations array.
 */
function extractCitationJson(text: string): { readonly match: string; readonly citations: readonly Record<string, string>[] } | null {
  for (const pattern of CITATION_JSON_PATTERNS) {
    const jsonMatch = text.match(pattern);
    if (!jsonMatch) continue;

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed.citations)) {
        return { match: jsonMatch[0], citations: parsed.citations };
      }
    } catch {
      // Try next pattern
    }
  }
  return null;
}

/**
 * Strip citation JSON block from the answer text so it doesn't
 * leak into the rendered message content.
 * Uses bracket counting to handle nested JSON reliably.
 */
export function stripCitationBlock(text: string): string {
  // First try regex for simple cases
  for (const pattern of CITATION_JSON_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        JSON.parse(match[1]); // Verify it's valid JSON
        return text.replace(match[0], "").replace(/\n{3,}/g, "\n\n").trim();
      } catch {
        // Regex matched incomplete JSON; fall through to bracket counting
      }
    }
  }

  // Bracket-counting fallback for complex/nested JSON
  const citIdx = text.indexOf('"citations"');
  if (citIdx === -1) return text;

  // Walk backward to find opening `{`
  let start = -1;
  for (let i = citIdx - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === "{") { start = i; break; }
    if (ch !== " " && ch !== "\n" && ch !== "\r" && ch !== "\t" && ch !== "`") break;
  }
  // Check for fenced block
  const fenceIdx = text.lastIndexOf("```", citIdx);
  if (fenceIdx !== -1 && fenceIdx >= (start === -1 ? 0 : start) - 10) {
    start = fenceIdx;
  }
  if (start === -1) start = citIdx;

  // Count brackets to find matching close
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) {
        let end = i + 1;
        const rest = text.slice(end).trimStart();
        if (rest.startsWith("```")) end = text.indexOf("```", end) + 3;
        return (text.slice(0, start) + text.slice(end)).replace(/\n{3,}/g, "\n\n").trim();
      }
    }
  }

  // Incomplete — strip from start to end
  return text.slice(0, start).replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Parse citations from the LLM response text.
 * Handles both fenced (```json) and bare JSON citation blocks.
 */
function parseCitations(
  text: string,
  contexts: readonly RetrievedContext[],
): readonly Citation[] {
  const extracted = extractCitationJson(text);
  if (extracted) {
    const citations: Citation[] = [];
    for (const cite of extracted.citations) {
      const matchedContext = contexts.find(
        (c) =>
          c.section_number === cite.section_number ||
          c.regulation_name.includes(cite.regulation_name) ||
          cite.regulation_name.includes(c.regulation_short_name),
      );

      citations.push({
        regulation_id: matchedContext?.regulation_id ?? "",
        section_id: matchedContext?.section_id ?? "",
        regulation_name: cite.regulation_name,
        section_number: cite.section_number,
        excerpt: cite.excerpt,
        official_url: cite.official_url || matchedContext?.official_url || "",
        relevance_score: matchedContext?.score ?? 0.5,
      });
    }
    if (citations.length > 0) return citations;
  }

  // Fallback: extract inline citations like [Law Name, Section]
  return extractInlineCitations(text, contexts);
}

/**
 * Fallback citation extraction using inline citation patterns.
 */
function extractInlineCitations(
  text: string,
  contexts: readonly RetrievedContext[],
): readonly Citation[] {
  const citations: Citation[] = [];
  const inlineCiteRegex = /\*\*\[?([^*\]]+)\]?\*\*\s+\[?(s\.\d+[^:]*|Part\s+\d+[^:]*|Division\s+\d+[^:]*|B\.\d+[^:]*)\]?/g;
  let match;
  while ((match = inlineCiteRegex.exec(text)) !== null) {
    const regName = match[1].trim();
    const sectionNum = match[2].trim();

    const matchedContext = contexts.find(
      (c) =>
        c.section_number.includes(sectionNum) ||
        c.regulation_short_name === regName,
    );

    if (matchedContext) {
      const alreadyExists = citations.some(
        (c) => c.section_id === matchedContext.section_id,
      );
      if (!alreadyExists) {
        citations.push({
          regulation_id: matchedContext.regulation_id,
          section_id: matchedContext.section_id,
          regulation_name: matchedContext.regulation_name,
          section_number: matchedContext.section_number,
          excerpt: matchedContext.content.slice(0, 200),
          official_url: matchedContext.official_url,
          relevance_score: matchedContext.score,
        });
      }
    }
  }

  return citations;
}

/**
 * Generate a non-streaming Q&A response.
 */
export async function generateAnswer(
  question: string,
  options: QAOptions = {},
): Promise<QAResult> {
  const startTime = Date.now();
  const language = options.language ?? "ko";

  // 0. Classify domain (food vs nhp vs both)
  const domainClassification = await classifyDomain(question);

  // 1. Retrieve relevant regulation context (domain-aware)
  const contexts = await retrieveContext(question, {
    topics: options.topics,
    applies_to: options.applies_to,
    limit: 10,
    productDomain: domainClassification.domain,
  });

  // 2. Build system prompt with context (domain-aware)
  const systemPrompt = buildQAPrompt(
    contexts.map((c) => ({
      content: c.content,
      section_number: c.section_number,
      regulation_name: `${c.regulation_name} (${c.regulation_short_name})`,
      official_url: c.section_url ?? c.official_url,
      source: c.source,
    })),
    language,
    domainClassification.domain,
  );

  // 3. Generate answer with Claude (using messages for history support)
  const messages = buildMessages(question, options.history);
  const { text } = await generateText({
    model: anthropic(MODEL),
    system: systemPrompt,
    messages: [...messages],
    maxOutputTokens: 4000,
    temperature: 0.1,
  });

  // 4. Parse citations, then strip the JSON block from the visible answer
  const citations = parseCitations(text, contexts);
  const cleanAnswer = stripCitationBlock(text);

  return {
    answer: cleanAnswer,
    rawAnswer: text,
    citations,
    contexts,
    processingTimeMs: Date.now() - startTime,
    domainClassification,
  };
}

/**
 * Generate a streaming Q&A response.
 */
export async function streamAnswer(
  question: string,
  options: QAOptions = {},
) {
  const language = options.language ?? "ko";

  // 0. Classify domain (food vs nhp vs both)
  const domainClassification = await classifyDomain(question);

  // 1. Retrieve relevant regulation context (domain-aware)
  const contexts = await retrieveContext(question, {
    topics: options.topics,
    applies_to: options.applies_to,
    limit: 10,
    productDomain: domainClassification.domain,
  });

  // 2. Build system prompt with context (domain-aware)
  const systemPrompt = buildQAPrompt(
    contexts.map((c) => ({
      content: c.content,
      section_number: c.section_number,
      regulation_name: `${c.regulation_name} (${c.regulation_short_name})`,
      official_url: c.section_url ?? c.official_url,
      source: c.source,
    })),
    language,
    domainClassification.domain,
  );

  // 3. Stream answer with Claude (using messages for history support)
  const messages = buildMessages(question, options.history);
  const result = streamText({
    model: anthropic(MODEL),
    system: systemPrompt,
    messages: [...messages],
    maxOutputTokens: 4000,
    temperature: 0.1,
  });

  return { stream: result, contexts, domainClassification };
}
