import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the coingecko module before importing the route
vi.mock("@/lib/coingecko", () => ({
  getCoins: vi.fn().mockResolvedValue([
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://example.com/btc.png",
      current_price: 50000,
      market_cap: 1e12,
      market_cap_rank: 1,
      total_volume: 3e10,
      price_change_percentage_24h: 2.5,
    },
  ]),
}));

// Mock rate-limit to not block
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ limited: false }),
}));

import { GET } from "@/app/api/coins/route";

describe("GET /api/coins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with coin data", async () => {
    const request = new Request("http://localhost/api/coins?page=1&per_page=50") as any;
    request.nextUrl = new URL("http://localhost/api/coins?page=1&per_page=50");

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe("bitcoin");
  });

  it("returns 400 for invalid page", async () => {
    const request = new Request("http://localhost/api/coins?page=-1") as any;
    request.nextUrl = new URL("http://localhost/api/coins?page=-1");

    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
