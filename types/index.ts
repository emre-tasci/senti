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
    subreddit_url: string | null;
  };
  community_data?: {
    twitter_followers: number | null;
    reddit_subscribers: number | null;
    reddit_accounts_active_48h: number | null;
    reddit_average_posts_48h: number | null;
    reddit_average_comments_48h: number | null;
    telegram_channel_user_count: number | null;
  };
  developer_data?: {
    forks: number | null;
    stars: number | null;
    subscribers: number | null;
    total_issues: number | null;
    closed_issues: number | null;
    pull_requests_merged: number | null;
    pull_request_contributors: number | null;
    commit_count_4_weeks: number | null;
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
  description?: string;
  votes?: {
    positive: number;
    negative: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
  };
  kind?: string;
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
  sentiment: string;
  confidence?: number;
  technical_signal?: string;
  timestamp: string;
}

// --- Technical Analysis ---

export interface TechnicalSignals {
  rsi_14: number | null;
  rsi_signal: "overbought" | "oversold" | "neutral";
  macd: {
    macd_line: number;
    signal_line: number;
    histogram: number;
    signal: "bullish" | "bearish" | "neutral";
  } | null;
  moving_averages: {
    sma_20: number | null;
    sma_50: number | null;
    ema_12: number | null;
    ema_26: number | null;
    price_vs_sma20: "above" | "below";
    price_vs_sma50: "above" | "below";
    golden_cross: boolean;
    death_cross: boolean;
  };
  bollinger_bands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    position: "above_upper" | "near_upper" | "middle" | "near_lower" | "below_lower";
  } | null;
  volume_analysis: {
    avg_volume_7d: number;
    current_volume: number;
    volume_change_pct: number;
    volume_trend: "increasing" | "decreasing" | "stable";
  } | null;
  support_resistance: {
    support: number[];
    resistance: number[];
  };
  overall_signal: "strong_bullish" | "bullish" | "neutral" | "bearish" | "strong_bearish";
  signal_strength: number;
}

// --- Social Metrics ---

export interface SocialMetrics {
  twitter_followers: number | null;
  reddit_subscribers: number | null;
  reddit_active_users_48h: number | null;
  reddit_posts_48h: number | null;
  reddit_comments_48h: number | null;
  telegram_users: number | null;
  github_stars: number | null;
  github_forks: number | null;
  github_commits_4w: number | null;
  social_buzz_level: "very_high" | "high" | "moderate" | "low" | "very_low";
  developer_activity: "very_active" | "active" | "moderate" | "low" | "inactive";
  community_size: "massive" | "large" | "medium" | "small" | "tiny";
  crowd_sentiment_score: number | null;
  crowd_sentiment: "positive" | "negative" | "neutral" | null;
}

// --- Enhanced Sentiment ---

export type EnhancedSentimentLevel = "strongly_bullish" | "bullish" | "neutral" | "bearish" | "strongly_bearish";

export interface SentimentDimension {
  score: number;
  signal: string;
  key_driver_tr: string;
  key_driver_en: string;
}

export interface EmotionalIndicators {
  fear_level: number;
  fomo_level: number;
  uncertainty_level: number;
}

export interface EnhancedSentimentAnalysis extends SentimentAnalysis {
  enhanced_sentiment: EnhancedSentimentLevel;
  confidence: number;
  dimensions: {
    news_sentiment: SentimentDimension;
    technical_outlook: SentimentDimension;
    social_buzz: SentimentDimension;
    market_context: SentimentDimension;
  };
  signal_alignment: "strong_consensus" | "moderate_consensus" | "mixed_signals" | "divergent";
  emotional_indicators: EmotionalIndicators;
  technical_signals: TechnicalSignals | null;
  social_metrics: SocialMetrics | null;
  risk_factors_tr: string[];
  risk_factors_en: string[];
  key_levels: {
    support: number[];
    resistance: number[];
  };
}

// --- Categories ---

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
