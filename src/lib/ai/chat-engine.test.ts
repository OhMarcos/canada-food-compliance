import { describe, it, expect, vi } from "vitest";

// Mock server-only to allow importing chat-engine in test environment
vi.mock("server-only", () => ({}));
// Mock ai SDK and anthropic provider (not needed for pure utility tests)
vi.mock("ai", () => ({ generateText: vi.fn(), streamText: vi.fn() }));
vi.mock("@ai-sdk/anthropic", () => ({ anthropic: vi.fn() }));

import { extractCrossDomainAlert, stripDomainAlert, stripCitationBlock } from "./chat-engine";

describe("extractCrossDomainAlert", () => {
  it("extracts NHP recommendation from food domain", () => {
    const text = "Some answer text.\n\n---DOMAIN_ALERT_START---\nThis product contains therapeutic claims and should be regulated as NHP.\n---DOMAIN_ALERT_END---\n\nMore text.";
    const result = extractCrossDomainAlert(text, "food");
    expect(result).toBeDefined();
    expect(result!.suggestedDomain).toBe("nhp");
    expect(result!.reason).toContain("therapeutic claims");
  });

  it("extracts food recommendation from NHP domain", () => {
    const text = "Answer.\n---DOMAIN_ALERT_START---\nNo therapeutic claims found. Consider food regulations.\n---DOMAIN_ALERT_END---";
    const result = extractCrossDomainAlert(text, "nhp");
    expect(result).toBeDefined();
    expect(result!.suggestedDomain).toBe("food");
    expect(result!.reason).toContain("No therapeutic claims");
  });

  it("returns undefined when no alert markers present", () => {
    const text = "Just a normal answer with no domain alerts.";
    const result = extractCrossDomainAlert(text, "food");
    expect(result).toBeUndefined();
  });

  it("returns undefined when markers are in wrong order", () => {
    const text = "---DOMAIN_ALERT_END---\nSome text\n---DOMAIN_ALERT_START---";
    const result = extractCrossDomainAlert(text, "food");
    expect(result).toBeUndefined();
  });

  it("returns undefined when alert text is empty", () => {
    const text = "---DOMAIN_ALERT_START---\n\n---DOMAIN_ALERT_END---";
    const result = extractCrossDomainAlert(text, "food");
    expect(result).toBeUndefined();
  });
});

describe("stripDomainAlert", () => {
  it("removes complete alert block", () => {
    const text = "Before alert.\n\n---DOMAIN_ALERT_START---\nAlert content here.\n---DOMAIN_ALERT_END---\n\nAfter alert.";
    const result = stripDomainAlert(text);
    expect(result).toContain("Before alert.");
    expect(result).toContain("After alert.");
    expect(result).not.toContain("DOMAIN_ALERT");
    expect(result).not.toContain("Alert content here");
  });

  it("returns text unchanged when no markers present", () => {
    const text = "Normal text without markers.";
    expect(stripDomainAlert(text)).toBe(text);
  });

  it("handles alert at end of text", () => {
    const text = "Answer text.\n\n---DOMAIN_ALERT_START---\nThis is NHP.\n---DOMAIN_ALERT_END---";
    const result = stripDomainAlert(text);
    expect(result).toBe("Answer text.");
  });
});

describe("stripCitationBlock", () => {
  it("strips fenced citation JSON", () => {
    const text = 'Answer text.\n\n```json\n{"citations": [{"regulation_name": "SFCA"}]}\n```';
    const result = stripCitationBlock(text);
    expect(result).toBe("Answer text.");
    expect(result).not.toContain("citations");
  });

  it("strips bare citation JSON", () => {
    const text = 'Answer text.\n\n{"citations": [{"regulation_name": "SFCA"}]}';
    const result = stripCitationBlock(text);
    expect(result).toBe("Answer text.");
  });

  it("returns text unchanged when no citations", () => {
    const text = "Just a normal answer.";
    expect(stripCitationBlock(text)).toBe(text);
  });
});
