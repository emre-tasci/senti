import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/categories";
import { getCategoryMarketData } from "@/lib/coingecko";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  if (rateLimit(request).limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const results = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const market = await getCategoryMarketData(cat.id);
        return {
          ...cat,
          market_cap: market?.market_cap ?? 0,
          volume_24h: market?.volume_24h ?? 0,
          market_cap_change_24h: market?.market_cap_change_24h ?? 0,
          top_3_coins: market?.top_3_coins ?? [],
          coins_count: market?.coins_count ?? 0,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
