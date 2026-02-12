import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";
import type { FearGreedData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cacheKey = "fear_greed";
    const cached = getCache<FearGreedData>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Fear & Greed API error: ${res.status}`);
    }

    const json = await res.json();
    const item = json.data?.[0];

    const data: FearGreedData = {
      value: parseInt(item?.value || "50", 10),
      value_classification: item?.value_classification || "Neutral",
      timestamp: item?.timestamp
        ? new Date(parseInt(item.timestamp, 10) * 1000).toISOString()
        : new Date().toISOString(),
    };

    setCache(cacheKey, data, 300);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Fear & Greed:", error);
    return NextResponse.json(
      { value: 50, value_classification: "Neutral", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  }
}
