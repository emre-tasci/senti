import { describe, it, expect, beforeEach } from "vitest";
import {
  getWatchlist,
  toggleWatchlist,
  isInWatchlist,
  getAlerts,
  addAlert,
  removeAlert,
  markAlertTriggered,
  getSentimentHistory,
  addSentimentSnapshot,
} from "@/lib/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("watchlist", () => {
  it("starts empty", () => {
    expect(getWatchlist()).toEqual([]);
  });

  it("adds a coin to watchlist", () => {
    const added = toggleWatchlist("bitcoin");
    expect(added).toBe(true);
    expect(isInWatchlist("bitcoin")).toBe(true);
    expect(getWatchlist()).toContain("bitcoin");
  });

  it("removes a coin from watchlist", () => {
    toggleWatchlist("bitcoin");
    const added = toggleWatchlist("bitcoin");
    expect(added).toBe(false);
    expect(isInWatchlist("bitcoin")).toBe(false);
  });

  it("manages multiple coins", () => {
    toggleWatchlist("bitcoin");
    toggleWatchlist("ethereum");
    expect(getWatchlist()).toEqual(["bitcoin", "ethereum"]);
    toggleWatchlist("bitcoin");
    expect(getWatchlist()).toEqual(["ethereum"]);
  });
});

describe("alerts", () => {
  it("starts with no alerts", () => {
    expect(getAlerts()).toEqual([]);
  });

  it("adds an alert", () => {
    const alert = addAlert({
      coinId: "bitcoin",
      coinName: "Bitcoin",
      targetPrice: 50000,
      direction: "above",
    });

    expect(alert.id).toBeDefined();
    expect(alert.triggered).toBe(false);
    expect(getAlerts()).toHaveLength(1);
    expect(getAlerts()[0].coinId).toBe("bitcoin");
  });

  it("removes an alert", () => {
    const alert = addAlert({
      coinId: "bitcoin",
      coinName: "Bitcoin",
      targetPrice: 50000,
      direction: "above",
    });

    removeAlert(alert.id);
    expect(getAlerts()).toHaveLength(0);
  });

  it("marks an alert as triggered", () => {
    const alert = addAlert({
      coinId: "bitcoin",
      coinName: "Bitcoin",
      targetPrice: 50000,
      direction: "above",
    });

    markAlertTriggered(alert.id);
    expect(getAlerts()[0].triggered).toBe(true);
  });
});

describe("sentiment history", () => {
  it("starts empty", () => {
    expect(getSentimentHistory("bitcoin")).toEqual([]);
  });

  it("adds a snapshot", () => {
    addSentimentSnapshot({
      coinId: "bitcoin",
      score: 75,
      sentiment: "positive",
      timestamp: new Date().toISOString(),
    });

    const history = getSentimentHistory("bitcoin");
    expect(history).toHaveLength(1);
    expect(history[0].score).toBe(75);
  });

  it("filters by coinId", () => {
    addSentimentSnapshot({
      coinId: "bitcoin",
      score: 75,
      sentiment: "positive",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    });
    addSentimentSnapshot({
      coinId: "ethereum",
      score: 60,
      sentiment: "neutral",
      timestamp: new Date().toISOString(),
    });

    expect(getSentimentHistory("bitcoin")).toHaveLength(1);
    expect(getSentimentHistory("ethereum")).toHaveLength(1);
  });
});
