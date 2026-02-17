import type { Locale } from "@/types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded or private browsing
  }
}

// --- Locale ---

export function getSavedLocale(): Locale | null {
  const val = getItem("coinscope_locale");
  if (val === "tr" || val === "en") return val;
  return null;
}

export function saveLocale(locale: Locale): void {
  setItem("coinscope_locale", locale);
}

// --- Watchlist ---

const WATCHLIST_KEY = "coinscope_watchlist";

function getWatchlistSet(): Set<string> {
  const raw = getItem(WATCHLIST_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function getWatchlist(): string[] {
  return Array.from(getWatchlistSet());
}

export function isInWatchlist(coinId: string): boolean {
  return getWatchlistSet().has(coinId);
}

export function toggleWatchlist(coinId: string): boolean {
  const set = getWatchlistSet();
  const added = !set.has(coinId);
  if (added) {
    set.add(coinId);
  } else {
    set.delete(coinId);
  }
  setItem(WATCHLIST_KEY, JSON.stringify(Array.from(set)));
  return added;
}

// --- Price Alerts ---

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: string;
}

const ALERTS_KEY = "coinscope_alerts";

function getAlertsArray(): PriceAlert[] {
  const raw = getItem(ALERTS_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getAlerts(): PriceAlert[] {
  return getAlertsArray();
}

export function addAlert(alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">): PriceAlert {
  const alerts = getAlertsArray();
  const newAlert: PriceAlert = {
    ...alert,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    triggered: false,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  setItem(ALERTS_KEY, JSON.stringify(alerts));
  return newAlert;
}

export function removeAlert(id: string): void {
  const alerts = getAlertsArray().filter((a) => a.id !== id);
  setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function markAlertTriggered(id: string): void {
  const alerts = getAlertsArray();
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.triggered = true;
    setItem(ALERTS_KEY, JSON.stringify(alerts));
  }
}

// --- Sentiment History ---

export interface SentimentSnapshot {
  coinId: string;
  score: number;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: string;
}

const SENTIMENT_HISTORY_KEY = "coinscope_sentiment_history";
const MAX_ENTRIES_PER_COIN = 30;
const DEDUP_MS = 3600_000; // 1 hour

function getAllSentimentHistory(): SentimentSnapshot[] {
  const raw = getItem(SENTIMENT_HISTORY_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getSentimentHistory(coinId: string): SentimentSnapshot[] {
  return getAllSentimentHistory().filter((s) => s.coinId === coinId);
}

export function addSentimentSnapshot(snapshot: SentimentSnapshot): void {
  const all = getAllSentimentHistory();
  const coinHistory = all.filter((s) => s.coinId === snapshot.coinId);

  // Dedup: skip if last entry for this coin is within 1 hour
  if (coinHistory.length > 0) {
    const last = coinHistory[coinHistory.length - 1];
    if (Date.now() - new Date(last.timestamp).getTime() < DEDUP_MS) return;
  }

  all.push(snapshot);

  // Trim to max entries per coin
  const coinCount = all.filter((s) => s.coinId === snapshot.coinId).length;
  if (coinCount > MAX_ENTRIES_PER_COIN) {
    const excess = coinCount - MAX_ENTRIES_PER_COIN;
    let removed = 0;
    const trimmed = all.filter((s) => {
      if (s.coinId === snapshot.coinId && removed < excess) {
        removed++;
        return false;
      }
      return true;
    });
    setItem(SENTIMENT_HISTORY_KEY, JSON.stringify(trimmed));
  } else {
    setItem(SENTIMENT_HISTORY_KEY, JSON.stringify(all));
  }
}
