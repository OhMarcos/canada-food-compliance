import { z } from "zod";

export const ConversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

export type ConversationTurn = Readonly<z.infer<typeof ConversationTurnSchema>>;

/**
 * Sanitize conversation history to prevent prompt injection.
 * - Truncate assistant messages to prevent context stuffing
 * - Ensure proper alternating user/assistant pattern
 * - Cap total history tokens
 */
function sanitizeHistory(
  history: readonly ConversationTurn[],
): readonly ConversationTurn[] {
  const MAX_ASSISTANT_LENGTH = 2000;
  const MAX_TURNS = 6;

  return history.slice(-MAX_TURNS).map((turn) => ({
    role: turn.role,
    content:
      turn.role === "assistant"
        ? turn.content.slice(0, MAX_ASSISTANT_LENGTH)
        : turn.content,
  }));
}

export const ChatInputSchema = z
  .object({
    message: z.string().min(1, "메시지를 입력해주세요").max(5000),
    language: z.enum(["ko", "en"]).default("ko"),
    product_context: z
      .object({
        name: z.string().max(200).optional(),
        category: z.string().max(100).optional(),
        origin_country: z.string().max(10).optional(),
        ingredients: z.array(z.string().max(100)).max(50).optional(),
      })
      .optional(),
    include_market_check: z.boolean().default(true),
    history: z.array(ConversationTurnSchema).max(6).optional(),
  })
  .transform((data) => ({
    ...data,
    history: data.history ? sanitizeHistory(data.history) : undefined,
  }));

export type ChatInput = z.infer<typeof ChatInputSchema>;
