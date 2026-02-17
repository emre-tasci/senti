import { getCache, setCache } from "./cache";
import type { NewsItem } from "@/types";

const CRYPTOPANIC_BASE = "https://cryptopanic.com/api/developer/v2";

export async function getCoinNews(symbol: string): Promise<NewsItem[]> {
  const cacheKey = `news_${symbol.toUpperCase()}`;
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.CRYPTOPANIC_API_KEY;

  if (!apiKey || apiKey === "xxxxxxxxxxxxx") {
    return getMockNews(symbol);
  }

  try {
    const res = await fetch(
      `${CRYPTOPANIC_BASE}/posts/?auth_token=${apiKey}&currencies=${symbol.toUpperCase()}&public=true&metadata=true`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      console.error(`CryptoPanic API error: ${res.status}`);
      return getMockNews(symbol);
    }

    const data = await res.json();
    const news: NewsItem[] = (data.results || []).slice(0, 15).map((item: Record<string, unknown>) => {
      // v2 API: source can be an object or missing; kind indicates type (news/blog/media)
      const src = item.source as Record<string, unknown> | undefined;
      const kind = String(item.kind || "news");
      const metadata = item.metadata as Record<string, unknown> | undefined;
      const votes = item.votes as Record<string, number> | undefined;
      return {
        id: String(item.id || item.title || Math.random()),
        title: String(item.title || "").trim(),
        url: String(item.url || "#"),
        source: {
          title: src?.title ? String(src.title) : kind.charAt(0).toUpperCase() + kind.slice(1),
          domain: src?.domain ? String(src.domain) : "",
        },
        published_at: String(item.published_at || new Date().toISOString()),
        currencies: Array.isArray(item.currencies) ? item.currencies : [],
        description: metadata?.description ? String(metadata.description).slice(0, 300) : undefined,
        votes: votes ? {
          positive: votes.positive || 0,
          negative: votes.negative || 0,
          important: votes.important || 0,
          liked: votes.liked || 0,
          disliked: votes.disliked || 0,
          lol: votes.lol || 0,
          toxic: votes.toxic || 0,
          saved: votes.saved || 0,
        } : undefined,
        kind,
      };
    });

    setCache(cacheKey, news, 300);
    return news;
  } catch (error) {
    console.error("CryptoPanic fetch error:", error);
    return getMockNews(symbol);
  }
}

function getMockNews(symbol: string): NewsItem[] {
  const now = new Date();
  return [
    {
      id: "mock-1",
      title: `${symbol.toUpperCase()} shows strong momentum as institutional interest grows`,
      url: "#",
      source: { title: "CryptoNews", domain: "cryptonews.com" },
      published_at: new Date(now.getTime() - 3600000).toISOString(),
      currencies: [{ code: symbol.toUpperCase(), title: symbol }],
    },
    {
      id: "mock-2",
      title: `Market analysts predict ${symbol.toUpperCase()} price movement amid regulatory developments`,
      url: "#",
      source: { title: "CoinDesk", domain: "coindesk.com" },
      published_at: new Date(now.getTime() - 7200000).toISOString(),
      currencies: [{ code: symbol.toUpperCase(), title: symbol }],
    },
    {
      id: "mock-3",
      title: `New partnership announcement boosts ${symbol.toUpperCase()} ecosystem growth`,
      url: "#",
      source: { title: "The Block", domain: "theblock.co" },
      published_at: new Date(now.getTime() - 10800000).toISOString(),
      currencies: [{ code: symbol.toUpperCase(), title: symbol }],
    },
  ];
}
