import { getCache, setCache } from "./cache";
import type { SentimentResult, SentimentAnalysis, NewsItem } from "@/types";

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_ENDPOINT = "https://api.x.ai/v1/chat/completions";
const MODEL = "grok-3-mini-fast";

interface GrokResponse {
  choices: { message: { content: string } }[];
}

async function callGrok(messages: { role: string; content: string }[], jsonMode = true): Promise<string> {
  if (!XAI_API_KEY || XAI_API_KEY === "xai-xxxxxxxxxxxxx") {
    throw new Error("XAI_API_KEY not configured");
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 2000,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(XAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`xAI API error ${res.status}: ${errText}`);
  }

  const data: GrokResponse = await res.json();
  return data.choices[0]?.message?.content || "";
}

export async function analyzeSentiment(
  coinName: string,
  coinSymbol: string,
  news: NewsItem[],
  price?: number,
  change24h?: number
): Promise<SentimentAnalysis> {
  const cacheKey = `sentiment_${coinSymbol.toLowerCase()}`;
  const cached = getCache<SentimentAnalysis>(cacheKey);
  if (cached) return { ...cached, cached: true };

  if (news.length === 0) {
    return getDefaultSentiment();
  }

  try {
    const newsText = news
      .map((n, i) => `${i + 1}. ${n.title}`)
      .join("\n");

    const response = await callGrok([
      {
        role: "system",
        content: `Sen bir kripto para haber analisti ve sentiment uzmanisin. Sana verilen haberleri analiz et ve ayrica kisa bir piyasa yorumu yaz. JSON formatinda yanit ver. Yatirim tavsiyesi VERME.

Yanit formati:
{
  "results": [
    {
      "index": 1,
      "sentiment": "positive" | "negative" | "neutral",
      "score": 0-100,
      "summary_tr": "Turkce 2-3 cumle ozet",
      "summary_en": "English 2-3 sentence summary"
    }
  ],
  "overall_score": 0-100,
  "overall_sentiment": "positive" | "negative" | "neutral",
  "comment_tr": "Turkce kisa piyasa yorumu (3-4 cumle)",
  "comment_en": "English short market commentary (3-4 sentences)"
}

Score: 0=cok negatif, 50=notr, 100=cok pozitif`,
      },
      {
        role: "user",
        content: `${coinName} (${coinSymbol}) - Fiyat: $${price || "N/A"}, 24s Degisim: ${change24h?.toFixed(2) || "N/A"}%\n\nHaberler:\n${newsText}`,
      },
    ]);

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      return getDefaultSentiment();
    }

    const results: SentimentResult[] = (parsed.results || []).map(
      (r: Record<string, unknown>, i: number) => ({
        sentiment: r.sentiment || "neutral",
        score: typeof r.score === "number" ? r.score : 50,
        summary_tr: String(r.summary_tr || ""),
        summary_en: String(r.summary_en || ""),
        title: news[i]?.title || "",
      })
    );

    const dist = { positive: 0, negative: 0, neutral: 0 };
    results.forEach((r) => dist[r.sentiment]++);
    const total = results.length || 1;

    const analysis: SentimentAnalysis = {
      overall_score: parsed.overall_score ?? 50,
      overall_sentiment: parsed.overall_sentiment ?? "neutral",
      distribution: {
        positive: Math.round((dist.positive / total) * 100),
        negative: Math.round((dist.negative / total) * 100),
        neutral: Math.round((dist.neutral / total) * 100),
      },
      results,
      ai_comment_tr: parsed.comment_tr || "Analiz mevcut degil.",
      ai_comment_en: parsed.comment_en || "Analysis not available.",
      cached: false,
    };

    setCache(cacheKey, analysis, 600);
    return analysis;
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return getDefaultSentiment();
  }
}

function getDefaultSentiment(): SentimentAnalysis {
  return {
    overall_score: 50,
    overall_sentiment: "neutral",
    distribution: { positive: 33, negative: 33, neutral: 34 },
    results: [],
    ai_comment_tr: "Sentiment analizi icin xAI API anahtari gereklidir. .env.local dosyasina XAI_API_KEY ekleyin.",
    ai_comment_en: "xAI API key required for sentiment analysis. Add XAI_API_KEY to .env.local file.",
    cached: false,
  };
}

export async function getMarketSentiment(
  topCoins: { name: string; symbol: string; change: number }[]
): Promise<{ comment_tr: string; comment_en: string }> {
  const cacheKey = "market_sentiment";
  const cached = getCache<{ comment_tr: string; comment_en: string }>(cacheKey);
  if (cached) return cached;

  try {
    const coinSummary = topCoins
      .map((c) => `${c.name} (${c.symbol}): ${c.change > 0 ? "+" : ""}${c.change.toFixed(2)}%`)
      .join("\n");

    const response = await callGrok([
      {
        role: "system",
        content:
          "Sen deneyimli bir kripto analistisin. Genel piyasa durumu hakkinda kisa bir yorum yaz. Hem Turkce hem Ingilizce. Yatirim tavsiyesi VERME. JSON: { \"comment_tr\": \"...\", \"comment_en\": \"...\" }",
      },
      {
        role: "user",
        content: `Piyasa durumu - En buyuk coinler:\n${coinSummary}`,
      },
    ]);

    const data = JSON.parse(response);
    setCache(cacheKey, data, 600);
    return data;
  } catch {
    return {
      comment_tr: "Piyasa analizi icin xAI API anahtari gereklidir.",
      comment_en: "xAI API key required for market analysis.",
    };
  }
}
