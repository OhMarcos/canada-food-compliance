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
  readonly citations: readonly Citation[];
  readonly contexts: readonly RetrievedContext[];
  readonly processingTimeMs: number;
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
 * Parse citations from the LLM response text.
 * Looks for JSON citation blocks in the response.
 */
function parseCitations(
  text: string,
  contexts: readonly RetrievedContext[],
): readonly Citation[] {
  const citations: Citation[] = [];

  // Try to extract JSON citation block
  const jsonMatch = text.match(/```json\s*(\{[\s\S]*?"citations"[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed.citations)) {
        for (const cite of parsed.citations) {
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
      }
    } catch {
      // JSON parsing failed, try regex fallback
    }
  }

  // Fallback: extract inline citations like [Law Name, Section]
  if (citations.length === 0) {
    return extractInlineCitations(text, contexts);
  }

  return citations;
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

  // 1. Retrieve relevant regulation context
  const contexts = await retrieveContext(question, {
    topics: options.topics,
    applies_to: options.applies_to,
    limit: 10,
  });

  // 2. Build system prompt with context
  const systemPrompt = buildQAPrompt(
    contexts.map((c) => ({
      content: c.content,
      section_number: c.section_number,
      regulation_name: `${c.regulation_name} (${c.regulation_short_name})`,
      official_url: c.section_url ?? c.official_url,
    })),
    language,
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

  // 4. Parse citations
  const citations = parseCitations(text, contexts);

  return {
    answer: text,
    citations,
    contexts,
    processingTimeMs: Date.now() - startTime,
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

  // 1. Retrieve relevant regulation context
  const contexts = await retrieveContext(question, {
    topics: options.topics,
    applies_to: options.applies_to,
    limit: 10,
  });

  // 2. Build system prompt with context
  const systemPrompt = buildQAPrompt(
    contexts.map((c) => ({
      content: c.content,
      section_number: c.section_number,
      regulation_name: `${c.regulation_name} (${c.regulation_short_name})`,
      official_url: c.section_url ?? c.official_url,
    })),
    language,
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

  return { stream: result, contexts };
}
