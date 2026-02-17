"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, TrendingDown, Bot, Star,
  BarChart3, Activity, ArrowUpCircle, ArrowDownCircle,
  Coins, Database, Trophy, Percent,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PriceChart } from "@/components/PriceChart";
import { SentimentHero } from "@/components/SentimentGauge";
import { SentimentTabs } from "@/components/SentimentTabs";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentDetails } from "@/components/SentimentDetails";
import { SentimentTrend } from "@/components/SentimentTrend";
import { TechnicalSignalsContent } from "@/components/TechnicalSignals";
import { SocialMetricsContent } from "@/components/SocialMetrics";
import { NewsCard } from "@/components/NewsCard";
import { AlertDialog } from "@/components/AlertDialog";
import { QueryErrorReset } from "@/components/QueryErrorReset";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { useCoinDetail, useCoinNews, useSentiment } from "@/hooks/useCoins";
import { useIsWatched } from "@/hooks/useWatchlist";
import { addSentimentSnapshot, getSentimentHistory } from "@/lib/storage";

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLocale();

  const { data: coinData, isLoading, error, refetch } = useCoinDetail(id);
  const detail = coinData?.detail ?? null;

  const { data: newsData } = useCoinNews(id, detail?.symbol || "");

  const sentimentParams = detail
    ? {
        name: detail.name,
        symbol: detail.symbol,
        price: detail.market_data.current_price.usd,
        change: detail.market_data.price_change_percentage_24h,
        change7d: detail.market_data.price_change_percentage_7d,
        change30d: detail.market_data.price_change_percentage_30d,
      }
    : null;

  const { data: sentiment, isLoading: sentimentLoading } = useSentiment(id, sentimentParams);
  const { watched, toggle: toggleWatchlist } = useIsWatched(id);

  const news = Array.isArray(newsData) ? newsData : [];
  const sentimentHistory = typeof window !== "undefined" ? getSentimentHistory(id) : [];

  // Record sentiment snapshot
  useEffect(() => {
    if (sentiment && typeof sentiment.overall_score === "number" && !sentiment.cached) {
      addSentimentSnapshot({
        coinId: id,
        score: sentiment.overall_score,
        sentiment: sentiment.enhanced_sentiment || sentiment.overall_sentiment,
        confidence: sentiment.confidence,
        technical_signal: sentiment.technical_signals?.overall_signal,
        timestamp: new Date().toISOString(),
      });
    }
  }, [sentiment, id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <QueryErrorReset error={error} onRetry={() => refetch()} message={t("error")} />
        ) : (
          <p className="text-muted-foreground">{t("error")}</p>
        )}
        <Link href="/">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("nav.home")}
          </Button>
        </Link>
      </div>
    );
  }

  const md = detail.market_data;
  const isPositive = md.price_change_percentage_24h >= 0;
  const aiComment = locale === "tr" ? sentiment?.ai_comment_tr : sentiment?.ai_comment_en;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Image
            src={detail.image.large}
            alt={detail.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {detail.name}
              <span className="text-muted-foreground text-sm uppercase">
                {detail.symbol}
              </span>
              <button
                onClick={toggleWatchlist}
                className="text-muted-foreground hover:text-yellow-500 transition-colors"
              >
                <Star
                  className={`h-5 w-5 ${
                    watched ? "fill-yellow-500 text-yellow-500" : ""
                  }`}
                />
              </button>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">
                {formatPrice(md.current_price.usd)}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {formatPercentage(md.price_change_percentage_24h)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("coin.marketCap"), value: formatLargeNumber(md.market_cap.usd), icon: BarChart3 },
          { label: t("coin.volume"), value: formatLargeNumber(md.total_volume.usd), icon: Activity },
          { label: t("coin.high24h"), value: formatPrice(md.high_24h.usd), icon: ArrowUpCircle },
          { label: t("coin.low24h"), value: formatPrice(md.low_24h.usd), icon: ArrowDownCircle },
          { label: t("coin.supply"), value: md.circulating_supply.toLocaleString(), icon: Coins },
          { label: t("coin.maxSupply"), value: md.max_supply ? md.max_supply.toLocaleString() : "∞", icon: Database },
          { label: t("coin.ath"), value: formatPrice(md.ath.usd), icon: Trophy },
          { label: "ATH %", value: `${md.ath_change_percentage.usd.toFixed(1)}%`, icon: Percent },
        ].map((stat) => (
          <Card key={stat.label} className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="text-sm font-medium font-mono">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Price Chart */}
      <PriceChart coinId={id} />

      {/* Price Alerts */}
      <AlertDialog
        coinId={id}
        coinName={detail.name}
        currentPrice={md.current_price.usd}
      />

      {/* Sentiment Trend */}
      <SentimentTrend history={sentimentHistory} />

      {/* Sentiment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            {t("sentiment.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sentimentLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">
                  {locale === "tr" ? "AI analiz yapiliyor..." : "AI analyzing..."}
                </p>
              </div>
              <Skeleton className="h-24" />
            </div>
          ) : sentiment ? (
            <div className="space-y-6">
              {/* Sentiment Hero — always visible */}
              <SentimentHero
                score={sentiment.overall_score}
                sentiment={sentiment.enhanced_sentiment || sentiment.overall_sentiment}
                confidence={sentiment.confidence}
                signalAlignment={sentiment.signal_alignment}
                dimensions={sentiment.dimensions}
                aiSummary={aiComment}
              />

              {/* Tabbed content */}
              <SentimentTabs
                tabs={[
                  {
                    key: "overview",
                    labelKey: "tabs.overview",
                    content: (
                      <SentimentOverview
                        aiComment={aiComment}
                        distribution={sentiment.distribution}
                        emotionalIndicators={sentiment.emotional_indicators}
                        confidence={sentiment.confidence}
                      />
                    ),
                  },
                  {
                    key: "technical",
                    labelKey: "tabs.technical",
                    content: sentiment.technical_signals ? (
                      <TechnicalSignalsContent signals={sentiment.technical_signals} />
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("error")}</p>
                    ),
                  },
                  {
                    key: "social",
                    labelKey: "tabs.social",
                    content: sentiment.social_metrics ? (
                      <SocialMetricsContent metrics={sentiment.social_metrics} />
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("error")}</p>
                    ),
                  },
                  {
                    key: "details",
                    labelKey: "tabs.details",
                    content: (
                      <SentimentDetails
                        dimensions={sentiment.dimensions}
                        riskFactorsTr={sentiment.risk_factors_tr}
                        riskFactorsEn={sentiment.risk_factors_en}
                        keyLevels={sentiment.key_levels}
                      />
                    ),
                  },
                ]}
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t("error")}</p>
          )}
        </CardContent>
      </Card>

      {/* News */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("news.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("news.noNews")}</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {news.map((item, index) => (
                <NewsCard
                  key={item.id}
                  news={item}
                  sentimentResult={sentiment?.results[index]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
