import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, getClientIdentifier } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const config = { maxRequests: 3, windowMs: 60_000 };

  it("allows first request", () => {
    const result = checkRateLimit("test-key-1", config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("allows requests up to the limit", () => {
    const key = "test-key-2";
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const key = "test-key-3";
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = "test-key-4";
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    checkRateLimit(key, config);

    // Exceed limit
    expect(checkRateLimit(key, config).allowed).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(60_001);

    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("uses separate windows for different keys", () => {
    checkRateLimit("key-a", config);
    checkRateLimit("key-a", config);
    checkRateLimit("key-a", config);
    expect(checkRateLimit("key-a", config).allowed).toBe(false);
    expect(checkRateLimit("key-b", config).allowed).toBe(true);
  });
});

describe("getClientIdentifier", () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request("https://example.com", {
      headers: new Headers(headers),
    });
  }

  it("prefers x-vercel-forwarded-for (rightmost IP)", () => {
    const req = makeRequest({
      "x-vercel-forwarded-for": "10.0.0.1, 192.168.1.1",
    });
    expect(getClientIdentifier(req)).toBe("192.168.1.1");
  });

  it("falls back to x-forwarded-for (rightmost IP)", () => {
    const req = makeRequest({
      "x-forwarded-for": "10.0.0.1, 172.16.0.1, 203.0.113.50",
    });
    expect(getClientIdentifier(req)).toBe("203.0.113.50");
  });

  it("falls back to x-real-ip", () => {
    const req = makeRequest({ "x-real-ip": "198.51.100.1" });
    expect(getClientIdentifier(req)).toBe("198.51.100.1");
  });

  it("returns 'anonymous' when no IP headers present", () => {
    const req = makeRequest({});
    expect(getClientIdentifier(req)).toBe("anonymous");
  });

  it("handles single IP in x-vercel-forwarded-for", () => {
    const req = makeRequest({ "x-vercel-forwarded-for": "10.0.0.1" });
    expect(getClientIdentifier(req)).toBe("10.0.0.1");
  });
});
