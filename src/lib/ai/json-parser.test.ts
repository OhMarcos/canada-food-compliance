import { describe, it, expect } from "vitest";
import { extractJson, safeParseJson } from "./json-parser";

describe("extractJson", () => {
  it("extracts JSON from markdown code fences", () => {
    const input = 'Here is the result:\n```json\n{"key": "value"}\n```\nDone.';
    expect(extractJson(input)).toBe('{"key": "value"}');
  });

  it("extracts JSON from fences without language tag", () => {
    const input = '```\n{"key": "value"}\n```';
    expect(extractJson(input)).toBe('{"key": "value"}');
  });

  it("extracts raw JSON object from prose", () => {
    const input = 'The answer is {"status": "ok", "count": 5} as shown above.';
    expect(extractJson(input)).toBe('{"status": "ok", "count": 5}');
  });

  it("handles nested braces correctly", () => {
    const input = '{"outer": {"inner": "value"}}';
    expect(extractJson(input)).toBe('{"outer": {"inner": "value"}}');
  });

  it("returns original text when no JSON found", () => {
    const input = "No JSON here at all";
    expect(extractJson(input)).toBe("No JSON here at all");
  });

  it("prefers fenced JSON over raw braces", () => {
    const input = 'Before {"wrong": true}\n```json\n{"right": true}\n```\nAfter';
    expect(extractJson(input)).toBe('{"right": true}');
  });

  it("handles multiline JSON in fences", () => {
    const input = '```json\n{\n  "key": "value",\n  "num": 42\n}\n```';
    const result = extractJson(input);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ key: "value", num: 42 });
  });
});

describe("safeParseJson", () => {
  it("parses valid JSON from fenced blocks", () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(safeParseJson(input)).toEqual({ key: "value" });
  });

  it("parses valid JSON from raw text", () => {
    const input = '{"key": "value"}';
    expect(safeParseJson(input)).toEqual({ key: "value" });
  });

  it("returns null for invalid JSON", () => {
    expect(safeParseJson("not json at all")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(safeParseJson('{"broken": }')).toBeNull();
  });

  it("handles arrays", () => {
    // extractJson looks for braces, arrays with [] won't be found
    // but fenced arrays work
    const input = '```json\n["a", "b"]\n```';
    expect(safeParseJson(input)).toEqual(["a", "b"]);
  });

  it("handles nested objects", () => {
    const input = '```json\n{"citations": [{"name": "SFCA", "section": "11"}]}\n```';
    const result = safeParseJson(input);
    expect(result).toEqual({
      citations: [{ name: "SFCA", section: "11" }],
    });
  });
});
