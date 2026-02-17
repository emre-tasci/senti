"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getWatchlist,
  isInWatchlist as checkWatchlist,
  toggleWatchlist as storageToggle,
} from "@/lib/storage";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    setWatchlist(getWatchlist());
  }, []);

  const toggle = useCallback((coinId: string) => {
    storageToggle(coinId);
    setWatchlist(getWatchlist());
  }, []);

  const isWatched = useCallback(
    (coinId: string) => watchlist.includes(coinId),
    [watchlist]
  );

  return { watchlist, toggle, isWatched };
}

export function useIsWatched(coinId: string) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(checkWatchlist(coinId));
  }, [coinId]);

  const toggle = useCallback(() => {
    storageToggle(coinId);
    setWatched(checkWatchlist(coinId));
  }, [coinId]);

  return { watched, toggle };
}
