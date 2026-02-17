"use client";

import { useQuery } from "@tanstack/react-query";
import type { Coin, CategoryDef, CategorySentiment } from "@/types";

interface CategoryWithMarket extends CategoryDef {
  market_cap: number;
  volume_24h: number;
  market_cap_change_24h: number;
  top_3_coins: string[];
  coins_count: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export function useCategories() {
  return useQuery<CategoryWithMarket[]>({
    queryKey: ["categories"],
    queryFn: () => fetchJson("/api/categories"),
  });
}

export function useCategoryCoins(categoryId: string, page: number) {
  return useQuery<Coin[]>({
    queryKey: ["categoryCoins", categoryId, page],
    queryFn: () =>
      fetchJson(`/api/categories/${categoryId}/coins?page=${page}&per_page=50`),
    enabled: !!categoryId,
  });
}

export function useCategorySentiment(categoryId: string) {
  return useQuery<CategorySentiment>({
    queryKey: ["categorySentiment", categoryId],
    queryFn: () => fetchJson(`/api/categories/${categoryId}/sentiment`),
    enabled: !!categoryId,
  });
}
