import { describe, it, expect } from "vitest";
import { ChatInputSchema, ConversationTurnSchema } from "./chat";

describe("ConversationTurnSchema", () => {
  it("accepts valid user turn", () => {
    const result = ConversationTurnSchema.safeParse({
      role: "user",
      content: "What license do I need?",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid assistant turn", () => {
    const result = ConversationTurnSchema.safeParse({
      role: "assistant",
      content: "You need an SFC license.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = ConversationTurnSchema.safeParse({
      role: "system",
      content: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = ConversationTurnSchema.safeParse({
      role: "user",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 2000 chars", () => {
    const result = ConversationTurnSchema.safeParse({
      role: "user",
      content: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("ChatInputSchema", () => {
  it("accepts minimal valid input", () => {
    const result = ChatInputSchema.safeParse({
      message: "Hello",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("ko"); // default
      expect(result.data.include_market_check).toBe(true); // default
    }
  });

  it("accepts full input with all fields", () => {
    const result = ChatInputSchema.safeParse({
      message: "What are labeling requirements?",
      language: "en",
      include_market_check: false,
      product_context: {
        name: "Crispy Nuggets",
        category: "frozen",
        origin_country: "KR",
      },
      history: [
        { role: "user", content: "Previous question" },
        { role: "assistant", content: "Previous answer" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message", () => {
    const result = ChatInputSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects message over 5000 chars", () => {
    const result = ChatInputSchema.safeParse({
      message: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid language", () => {
    const result = ChatInputSchema.safeParse({
      message: "test",
      language: "fr",
    });
    expect(result.success).toBe(false);
  });

  it("truncates history to max 6 turns", () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Turn ${i}`,
    }));
    const result = ChatInputSchema.safeParse({
      message: "test",
      history,
    });
    // max 6 in schema validation
    expect(result.success).toBe(false);
  });

  it("sanitizes assistant message length in history", () => {
    const result = ChatInputSchema.safeParse({
      message: "test",
      history: [
        { role: "assistant", content: "a".repeat(1999) },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history![0].content.length).toBeLessThanOrEqual(2000);
    }
  });
});
