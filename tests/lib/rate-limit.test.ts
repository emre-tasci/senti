import { describe, it, expect, beforeEach, vi } from "vitest";

// We need to re-import fresh module for each test to reset state
let rateLimit: (request: Request) => { limited: boolean };

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("@/lib/rate-limit");
  rateLimit = mod.rateLimit;
});

function makeRequest(ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    for (let i = 0; i < 30; i++) {
      expect(rateLimit(makeRequest()).limited).toBe(false);
    }
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 30; i++) {
      rateLimit(makeRequest());
    }
    expect(rateLimit(makeRequest()).limited).toBe(true);
  });

  it("tracks different IPs separately", () => {
    for (let i = 0; i < 30; i++) {
      rateLimit(makeRequest("10.0.0.1"));
    }
    // IP 10.0.0.1 is now limited
    expect(rateLimit(makeRequest("10.0.0.1")).limited).toBe(true);
    // Different IP should still be allowed
    expect(rateLimit(makeRequest("10.0.0.2")).limited).toBe(false);
  });
});
