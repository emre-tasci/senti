import type { PriceHistory, TechnicalSignals } from "@/types";

// --- Helpers ---

function sma(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function ema(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  // Seed with SMA of first `period` values
  let prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(prev);
  for (let i = period; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
}

function stdDev(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period;
  return Math.sqrt(variance);
}

// --- RSI (14-period) ---

function calculateRSI(prices: number[], period = 14): { value: number | null; signal: "overbought" | "oversold" | "neutral" } {
  if (prices.length < period + 1) return { value: null, signal: "neutral" };

  const deltas: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    deltas.push(prices[i] - prices[i - 1]);
  }

  // Use the last `period * 3` deltas for smoothed calculation (or all if less)
  const recentDeltas = deltas.slice(-period * 3);

  let avgGain = 0;
  let avgLoss = 0;

  // Initial averages from first `period` values
  for (let i = 0; i < Math.min(period, recentDeltas.length); i++) {
    if (recentDeltas[i] > 0) avgGain += recentDeltas[i];
    else avgLoss += Math.abs(recentDeltas[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  // Smooth over remaining values
  for (let i = period; i < recentDeltas.length; i++) {
    const gain = recentDeltas[i] > 0 ? recentDeltas[i] : 0;
    const loss = recentDeltas[i] < 0 ? Math.abs(recentDeltas[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return { value: 100, signal: "overbought" };
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  const rounded = Math.round(rsi * 100) / 100;

  return {
    value: rounded,
    signal: rounded >= 70 ? "overbought" : rounded <= 30 ? "oversold" : "neutral",
  };
}

// --- MACD (12, 26, 9) ---

function calculateMACD(prices: number[]): TechnicalSignals["macd"] {
  if (prices.length < 35) return null; // need at least 26 + 9

  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);

  // Align: ema12 starts at index 12, ema26 at index 26
  // MACD line = ema12 - ema26 (aligned from index 26)
  const offset = 26 - 12; // 14
  const macdLine: number[] = [];
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[i + offset] - ema26[i]);
  }

  if (macdLine.length < 9) return null;

  const signalLine = ema(macdLine, 9);
  const lastMACD = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];
  const histogram = lastMACD - lastSignal;

  return {
    macd_line: Math.round(lastMACD * 10000) / 10000,
    signal_line: Math.round(lastSignal * 10000) / 10000,
    histogram: Math.round(histogram * 10000) / 10000,
    signal: histogram > 0 ? "bullish" : histogram < 0 ? "bearish" : "neutral",
  };
}

// --- Bollinger Bands (20, 2) ---

function calculateBollinger(prices: number[]): TechnicalSignals["bollinger_bands"] {
  if (prices.length < 20) return null;

  const middle = sma(prices, 20)!;
  const sd = stdDev(prices, 20)!;
  const upper = middle + 2 * sd;
  const lower = middle - 2 * sd;
  const bandwidth = middle > 0 ? (upper - lower) / middle : 0;
  const current = prices[prices.length - 1];

  let position: "above_upper" | "near_upper" | "middle" | "near_lower" | "below_lower";
  if (current > upper) position = "above_upper";
  else if (current > middle + sd) position = "near_upper";
  else if (current < lower) position = "below_lower";
  else if (current < middle - sd) position = "near_lower";
  else position = "middle";

  return {
    upper: Math.round(upper * 100) / 100,
    middle: Math.round(middle * 100) / 100,
    lower: Math.round(lower * 100) / 100,
    bandwidth: Math.round(bandwidth * 10000) / 10000,
    position,
  };
}

// --- Volume Analysis ---

function calculateVolumeAnalysis(volumes: [number, number][]): TechnicalSignals["volume_analysis"] {
  if (volumes.length < 7) return null;

  const recentVolumes = volumes.slice(-7).map((v) => v[1]);
  const avg7d = recentVolumes.reduce((a, b) => a + b, 0) / 7;
  const current = recentVolumes[recentVolumes.length - 1];
  const changePct = avg7d > 0 ? ((current - avg7d) / avg7d) * 100 : 0;

  // Compare recent 3-day avg vs 7-day avg for trend
  const recent3 = recentVolumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
  let trend: "increasing" | "decreasing" | "stable";
  if (recent3 > avg7d * 1.1) trend = "increasing";
  else if (recent3 < avg7d * 0.9) trend = "decreasing";
  else trend = "stable";

  return {
    avg_volume_7d: Math.round(avg7d),
    current_volume: Math.round(current),
    volume_change_pct: Math.round(changePct * 100) / 100,
    volume_trend: trend,
  };
}

// --- Support/Resistance ---

function calculateSupportResistance(prices: number[]): { support: number[]; resistance: number[] } {
  if (prices.length < 10) return { support: [], resistance: [] };

  const localMin: number[] = [];
  const localMax: number[] = [];

  // Find local minima/maxima (window of 5)
  for (let i = 2; i < prices.length - 2; i++) {
    if (
      prices[i] <= prices[i - 1] && prices[i] <= prices[i - 2] &&
      prices[i] <= prices[i + 1] && prices[i] <= prices[i + 2]
    ) {
      localMin.push(prices[i]);
    }
    if (
      prices[i] >= prices[i - 1] && prices[i] >= prices[i - 2] &&
      prices[i] >= prices[i + 1] && prices[i] >= prices[i + 2]
    ) {
      localMax.push(prices[i]);
    }
  }

  // Cluster nearby levels (within 2%)
  function cluster(levels: number[]): number[] {
    if (levels.length === 0) return [];
    const sorted = [...levels].sort((a, b) => a - b);
    const clusters: number[][] = [[sorted[0]]];
    for (let i = 1; i < sorted.length; i++) {
      const last = clusters[clusters.length - 1];
      const avg = last.reduce((a, b) => a + b, 0) / last.length;
      if (Math.abs(sorted[i] - avg) / avg < 0.02) {
        last.push(sorted[i]);
      } else {
        clusters.push([sorted[i]]);
      }
    }
    // Return average of each cluster, sorted, top 3
    return clusters
      .map((c) => Math.round((c.reduce((a, b) => a + b, 0) / c.length) * 100) / 100)
      .sort((a, b) => b - a)
      .slice(0, 3);
  }

  const currentPrice = prices[prices.length - 1];
  const support = cluster(localMin).filter((l) => l < currentPrice).slice(0, 2);
  const resistance = cluster(localMax).filter((l) => l > currentPrice).slice(0, 2);

  return { support, resistance };
}

// --- Overall Signal ---

function calculateOverallSignal(
  rsi: { value: number | null; signal: string },
  macd: TechnicalSignals["macd"],
  priceVsSma20: "above" | "below",
  priceVsSma50: "above" | "below",
  bollingerPos: string | undefined,
  volumeTrend: string | undefined
): { signal: TechnicalSignals["overall_signal"]; strength: number } {
  let score = 0; // -100 to +100

  // RSI (weight: 25%)
  if (rsi.value !== null) {
    if (rsi.value > 70) score -= 25;
    else if (rsi.value > 60) score -= 10;
    else if (rsi.value < 30) score += 25;
    else if (rsi.value < 40) score += 10;
  }

  // MACD (weight: 25%)
  if (macd) {
    if (macd.signal === "bullish") score += 25;
    else if (macd.signal === "bearish") score -= 25;
  }

  // MA position (weight: 20%)
  if (priceVsSma20 === "above") score += 10;
  else score -= 10;
  if (priceVsSma50 === "above") score += 10;
  else score -= 10;

  // Bollinger (weight: 15%)
  if (bollingerPos === "above_upper") score -= 15;
  else if (bollingerPos === "near_upper") score -= 5;
  else if (bollingerPos === "below_lower") score += 15;
  else if (bollingerPos === "near_lower") score += 5;

  // Volume (weight: 15%)
  if (volumeTrend === "increasing") score += 8;
  else if (volumeTrend === "decreasing") score -= 8;

  // Map score to signal
  let signal: TechnicalSignals["overall_signal"];
  if (score >= 40) signal = "strong_bullish";
  else if (score >= 15) signal = "bullish";
  else if (score <= -40) signal = "strong_bearish";
  else if (score <= -15) signal = "bearish";
  else signal = "neutral";

  // Normalize strength to 0-100
  const strength = Math.round(Math.min(100, Math.max(0, (score + 100) / 2)));

  return { signal, strength };
}

// --- Main Export ---

export function calculateTechnicalSignals(history: PriceHistory): TechnicalSignals {
  const prices = history.prices.map((p) => p[1]);
  const currentPrice = prices[prices.length - 1] ?? 0;

  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bollingerBands = calculateBollinger(prices);
  const volumeAnalysis = calculateVolumeAnalysis(history.total_volumes);
  const sr = calculateSupportResistance(prices);

  const sma20 = sma(prices, 20);
  const sma50 = sma(prices, 50);
  const ema12Values = ema(prices, 12);
  const ema26Values = ema(prices, 26);
  const ema12Last = ema12Values.length > 0 ? ema12Values[ema12Values.length - 1] : null;
  const ema26Last = ema26Values.length > 0 ? ema26Values[ema26Values.length - 1] : null;

  const priceVsSma20: "above" | "below" = sma20 !== null && currentPrice >= sma20 ? "above" : "below";
  const priceVsSma50: "above" | "below" = sma50 !== null && currentPrice >= sma50 ? "above" : "below";

  // Golden/Death cross: check if SMA20 crossed SMA50 in the last few data points
  let goldenCross = false;
  let deathCross = false;
  if (prices.length >= 55) {
    const prevSma20 = sma(prices.slice(0, -5), 20);
    const prevSma50 = sma(prices.slice(0, -5), 50);
    if (prevSma20 !== null && prevSma50 !== null && sma20 !== null && sma50 !== null) {
      if (prevSma20 < prevSma50 && sma20 > sma50) goldenCross = true;
      if (prevSma20 > prevSma50 && sma20 < sma50) deathCross = true;
    }
  }

  const overall = calculateOverallSignal(
    rsi, macd, priceVsSma20, priceVsSma50,
    bollingerBands?.position, volumeAnalysis?.volume_trend
  );

  return {
    rsi_14: rsi.value,
    rsi_signal: rsi.signal,
    macd,
    moving_averages: {
      sma_20: sma20 !== null ? Math.round(sma20 * 100) / 100 : null,
      sma_50: sma50 !== null ? Math.round(sma50 * 100) / 100 : null,
      ema_12: ema12Last !== null ? Math.round(ema12Last * 100) / 100 : null,
      ema_26: ema26Last !== null ? Math.round(ema26Last * 100) / 100 : null,
      price_vs_sma20: priceVsSma20,
      price_vs_sma50: priceVsSma50,
      golden_cross: goldenCross,
      death_cross: deathCross,
    },
    bollinger_bands: bollingerBands,
    volume_analysis: volumeAnalysis,
    support_resistance: sr,
    overall_signal: overall.signal,
    signal_strength: overall.strength,
  };
}
