import { describe, it, expect } from "vitest";
import { buildQAPrompt, SYSTEM_PROMPT_QA_EN, SYSTEM_PROMPT_QA_KO, SYSTEM_PROMPT_VERIFIER } from "./prompts";

describe("buildQAPrompt", () => {
  const sampleContext = [
    {
      content: "No person shall import food unless the food meets requirements.",
      section_number: "Section 11",
      regulation_name: "Safe Food for Canadians Act",
      official_url: "https://laws-lois.justice.gc.ca/eng/acts/S-1.1/",
    },
    {
      content: "All prepackaged products must bear a label with prescribed information.",
      section_number: "Section 5",
      regulation_name: "Safe Food for Canadians Regulations",
      official_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/",
    },
  ] as const;

  it("builds Korean prompt with context", () => {
    const result = buildQAPrompt(sampleContext, "ko");
    expect(result).toContain("캐나다 식품 규제 전문 어드바이저");
    expect(result).toContain("Safe Food for Canadians Act");
    expect(result).toContain("Section 11");
    expect(result).toContain("Section 5");
  });

  it("builds English prompt with context", () => {
    const result = buildQAPrompt(sampleContext, "en");
    expect(result).toContain("Canadian food regulatory compliance advisor");
    expect(result).toContain("Safe Food for Canadians Act");
  });

  it("includes numbered context sections", () => {
    const result = buildQAPrompt(sampleContext, "en");
    expect(result).toContain("[1]");
    expect(result).toContain("[2]");
  });

  it("includes official URLs", () => {
    const result = buildQAPrompt(sampleContext, "en");
    expect(result).toContain("https://laws-lois.justice.gc.ca/eng/acts/S-1.1/");
  });

  it("separates context sections with delimiters", () => {
    const result = buildQAPrompt(sampleContext, "en");
    expect(result).toContain("---");
  });

  it("handles empty context", () => {
    const result = buildQAPrompt([], "en");
    expect(result).toContain("Canadian food regulatory compliance advisor");
    // Should still have the base prompt even with no context
  });
});

describe("prompt constants", () => {
  it("SYSTEM_PROMPT_QA_EN contains core rules", () => {
    expect(SYSTEM_PROMPT_QA_EN).toContain("Core Rules");
    expect(SYSTEM_PROMPT_QA_EN).toContain("legal citations");
  });

  it("SYSTEM_PROMPT_QA_KO contains core rules in Korean", () => {
    expect(SYSTEM_PROMPT_QA_KO).toContain("핵심 규칙");
    expect(SYSTEM_PROMPT_QA_KO).toContain("법적 인용");
  });

  it("SYSTEM_PROMPT_VERIFIER contains verification criteria", () => {
    expect(SYSTEM_PROMPT_VERIFIER).toContain("Citation Accuracy");
    expect(SYSTEM_PROMPT_VERIFIER).toContain("Overclaims");
    expect(SYSTEM_PROMPT_VERIFIER).toContain("is_accurate");
  });
});
