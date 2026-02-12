import { getCache, setCache } from "./cache";
import type { Coin, CoinDetail, PriceHistory } from "@/types";

const BASE_URL = process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3";

async function fetchCG<T>(path: string, cacheKey: string, ttl: number): Promise<T> {
  const cached = getCache<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: ttl },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  const data: T = await res.json();
  setCache(cacheKey, data, ttl);
  return data;
}

export async function getCoins(page = 1, perPage = 50): Promise<Coin[]> {
  return fetchCG<Coin[]>(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`,
    `coins_page_${page}_${perPage}`,
    60
  );
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  return fetchCG<CoinDetail>(
    `/coins/${encodeURIComponent(id)}?localization=true&tickers=false&community_data=false&developer_data=false`,
    `coin_detail_${id}`,
    30
  );
}

export async function getCoinPriceHistory(
  id: string,
  days: number | string = 7
): Promise<PriceHistory> {
  return fetchCG<PriceHistory>(
    `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
    `coin_history_${id}_${days}`,
    60
  );
}

export async function getGlobalData(): Promise<{
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number };
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
  };
}> {
  return fetchCG(
    "/global",
    "global_data",
    60
  );
}

export async function searchCoins(query: string): Promise<{
  coins: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number }[];
}> {
  return fetchCG(
    `/search?query=${encodeURIComponent(query)}`,
    `search_${query}`,
    120
  );
}
