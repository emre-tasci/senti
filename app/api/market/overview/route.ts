import { NextResponse } from "next/server";
import { getGlobalData, getCoins } from "@/lib/coingecko";
import { getMarketSentiment } from "@/lib/xai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [globalData, coins] = await Promise.all([
      getGlobalData(),
      getCoins(1, 100),
    ]);

    const sorted = [...coins].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );

    const topGainers = sorted.slice(0, 10);
    const topLosers = sorted.slice(-10).reverse();

    // Get AI market sentiment
    const topForSentiment = coins.slice(0, 10).map((c) => ({
      name: c.name,
      symbol: c.symbol,
      change: c.price_change_percentage_24h,
    }));

    let aiComment;
    try {
      aiComment = await getMarketSentiment(topForSentiment);
    } catch {
      aiComment = {
        comment_tr: "Piyasa analizi su anda mevcut degil.",
        comment_en: "Market analysis currently unavailable.",
      };
    }

    return NextResponse.json({
      total_market_cap: globalData.data.total_market_cap.usd,
      total_volume: globalData.data.total_volume.usd,
      btc_dominance: globalData.data.market_cap_percentage.btc,
      market_cap_change_24h: globalData.data.market_cap_change_percentage_24h_usd,
      active_cryptocurrencies: globalData.data.active_cryptocurrencies,
      top_gainers: topGainers,
      top_losers: topLosers,
      ai_comment: aiComment,
    });
  } catch (error) {
    console.error("Error fetching market overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch market overview" },
      { status: 500 }
    );
  }
}
