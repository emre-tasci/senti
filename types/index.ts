export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string; small: string; thumb: string };
  description: { en: string; tr?: string };
  market_data: {
    current_price: { usd: number; try: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: { title: string; domain: string };
  published_at: string;
  currencies?: { code: string; title: string }[];
}

export interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  summary_tr: string;
  summary_en: string;
  title: string;
}

export interface SentimentAnalysis {
  overall_score: number;
  overall_sentiment: "positive" | "negative" | "neutral";
  distribution: { positive: number; negative: number; neutral: number };
  results: SentimentResult[];
  ai_comment_tr: string;
  ai_comment_en: string;
  cached: boolean;
}

export interface MarketOverviewData {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  market_cap_change_24h: number;
  active_cryptocurrencies: number;
  top_gainers: Coin[];
  top_losers: Coin[];
}

export interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
}

export type Locale = "tr" | "en";

export interface Translations {
  [key: string]: string;
}

export interface WatchlistState {
  ids: string[];
}

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: string;
}

export interface AlertsState {
  alerts: PriceAlert[];
}

export interface SentimentSnapshot {
  coinId: string;
  score: number;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: string;
}

export interface CategoryDef {
  id: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  icon: string;
  color: string;
}

export interface CategoryMarketData {
  id: string;
  market_cap: number;
  volume_24h: number;
  market_cap_change_24h: number;
  top_3_coins: string[];
  coins_count: number;
}

export interface CategorySentiment {
  overall_score: number;
  overall_sentiment: "positive" | "negative" | "neutral";
  ai_comment_tr: string;
  ai_comment_en: string;
}
