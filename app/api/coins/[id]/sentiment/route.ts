import { NextRequest, NextResponse } from "next/server";
import { getCoinNews } from "@/lib/news";
import { getCoinDetail, getCoinPriceHistory } from "@/lib/coingecko";
import { analyzeEnhancedSentiment } from "@/lib/xai";
import { calculateTechnicalSignals } from "@/lib/technical-analysis";
import { extractSocialMetrics } from "@/lib/social";
import { fetchRedditData } from "@/lib/reddit";
import { rateLimit } from "@/lib/rate-limit";
import { getCache, setCache, clearCache } from "@/lib/cache";
import { isValidCoinId, isValidSymbol, isValidNumericParam } from "@/lib/validation";
import type { FearGreedData } from "@/types";

async function getFearGreedValue(): Promise<number | null> {
  const cached = getCache<FearGreedData>("fear_greed");
  if (cached) return cached.value;

  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data?.[0];
    const value = parseInt(item?.value || "50", 10);
    setCache("fear_greed", {
      value,
      value_classification: item?.value_classification || "Neutral",
      timestamp: new Date().toISOString(),
    }, 300);
    return value;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (rateLimit(request).limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isValidCoinId(params.id)) {
    return NextResponse.json({ error: "Invalid coin ID" }, { status: 400 });
  }

  try {
    const { searchParams } = request.nextUrl;

    // Allow cache-bust via ?refresh=1
    if (searchParams.get("refresh") === "1") {
      clearCache(`enhanced_sentiment_`);
    }

    const name = searchParams.get("name") || params.id;
    const symbol = searchParams.get("symbol") || params.id;
    const priceStr = searchParams.get("price") || "0";
    const changeStr = searchParams.get("change") || "0";
    const change7dStr = searchParams.get("change7d") || "0";
    const change30dStr = searchParams.get("change30d") || "0";

    if (searchParams.has("symbol") && !isValidSymbol(symbol)) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    if (
      (searchParams.has("price") && !isValidNumericParam(priceStr)) ||
      (searchParams.has("change") && !isValidNumericParam(changeStr))
    ) {
      return NextResponse.json({ error: "Invalid numeric parameter" }, { status: 400 });
    }

    const price = parseFloat(priceStr) || undefined;
    const change24h = parseFloat(changeStr) || undefined;
    const change7d = parseFloat(change7dStr) || undefined;
    const change30d = parseFloat(change30dStr) || undefined;

    // Gather all data sources in parallel
    const [news, coinDetail, priceHistory30d, fearGreedValue] = await Promise.all([
      getCoinNews(symbol),
      getCoinDetail(params.id).catch(() => null),
      getCoinPriceHistory(params.id, 30).catch(() => null),
      getFearGreedValue(),
    ]);

    // Fetch Reddit data directly (CoinGecko no longer provides Reddit metrics)
    // This must be sequential because we need coinDetail.links.subreddit_url first
    const subredditUrl = coinDetail?.links?.subreddit_url;
    const redditData = subredditUrl
      ? await fetchRedditData(subredditUrl).catch((err) => {
          console.warn("Reddit fetch failed:", err);
          return null;
        })
      : null;

    if (redditData) {
      console.log(`Reddit data for ${symbol}: subscribers=${redditData.subscribers}, posts_48h=${redditData.posts_48h}, comments_48h=${redditData.comments_48h}`);
    } else if (subredditUrl) {
      console.warn(`No Reddit data returned for ${subredditUrl}`);
    }

    // Calculate technical signals from price history
    const technicalSignals = priceHistory30d
      ? calculateTechnicalSignals(priceHistory30d)
      : null;

    // Extract social metrics from coin detail + Reddit API
    const socialMetrics = coinDetail
      ? extractSocialMetrics(coinDetail, news, redditData)
      : null;

    // Run enhanced AI analysis
    const sentiment = await analyzeEnhancedSentiment(
      name, symbol, news,
      technicalSignals, socialMetrics, fearGreedValue,
      price, change24h, change7d, change30d,
    );

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
