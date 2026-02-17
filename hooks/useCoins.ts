"use client";

import { useQuery } from "@tanstack/react-query";
import type { Coin, CoinDetail, PriceHistory, NewsItem, EnhancedSentimentAnalysis, FearGreedData } from "@/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export function useCoins(page: number) {
  return useQuery<Coin[]>({
    queryKey: ["coins", page],
    queryFn: () => fetchJson(`/api/coins?page=${page}&per_page=50`),
  });
}

export function useCoinDetail(coinId: string, days: string = "7") {
  return useQuery<{ detail: CoinDetail; history: PriceHistory }>({
    queryKey: ["coinDetail", coinId, days],
    queryFn: () => fetchJson(`/api/coins/${coinId}?days=${days}`),
    enabled: !!coinId,
  });
}

export function useCoinNews(coinId: string, symbol: string) {
  return useQuery<NewsItem[]>({
    queryKey: ["coinNews", coinId, symbol],
    queryFn: () => fetchJson(`/api/coins/${coinId}/news?symbol=${symbol}`),
    enabled: !!coinId && !!symbol,
  });
}

export function useSentiment(
  coinId: string,
  params: { name: string; symbol: string; price: number; change: number; change7d?: number; change30d?: number } | null
) {
  const qs = params
    ? new URLSearchParams({
        name: params.name,
        symbol: params.symbol,
        price: String(params.price),
        change: String(params.change),
        ...(params.change7d !== undefined && { change7d: String(params.change7d) }),
        ...(params.change30d !== undefined && { change30d: String(params.change30d) }),
      }).toString()
    : "";

  return useQuery<EnhancedSentimentAnalysis>({
    queryKey: ["sentiment", coinId],
    queryFn: () => fetchJson(`/api/coins/${coinId}/sentiment?${qs}`),
    enabled: !!coinId && !!params,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ["marketOverview"],
    queryFn: () =>
      fetchJson<{
        total_market_cap: number;
        total_volume: number;
        btc_dominance: number;
        market_cap_change_24h: number;
        active_cryptocurrencies: number;
        top_gainers: Coin[];
        top_losers: Coin[];
        ai_comment: { comment_tr: string; comment_en: string };
      }>("/api/market/overview"),
  });
}

export function useFearGreed() {
  return useQuery<FearGreedData>({
    queryKey: ["fearGreed"],
    queryFn: () => fetchJson("/api/market/fear-greed"),
  });
}
