"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, Bot, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FearGreedGauge } from "@/components/FearGreedGauge";
import { QueryErrorReset } from "@/components/QueryErrorReset";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { useMarketOverview, useFearGreed } from "@/hooks/useCoins";
import type { Coin } from "@/types";

function CoinRow({ coin }: { coin: Coin }) {
  const isPositive = coin.price_change_percentage_24h >= 0;
  return (
    <Link
      href={`/coin/${coin.id}`}
      className="flex items-center justify-between py-2 px-3 hover:bg-muted/30 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <Image src={coin.image} alt={coin.name} width={20} height={20} className="rounded-full" />
        <span className="text-sm font-medium">{coin.name}</span>
        <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono">{formatPrice(coin.current_price)}</span>
        <span
          className={`text-sm font-mono font-medium flex items-center gap-1 ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {formatPercentage(coin.price_change_percentage_24h)}
        </span>
      </div>
    </Link>
  );
}

export default function MarketPage() {
  const { t, locale } = useLocale();
  const { data: market, isLoading: marketLoading, error: marketError, refetch: refetchMarket } = useMarketOverview();
  const { data: fearGreed, isLoading: fgLoading } = useFearGreed();

  const loading = marketLoading && fgLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (marketError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <QueryErrorReset error={marketError} onRetry={() => refetchMarket()} message={t("error")} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t("market.title")}</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("market.totalCap")}</p>
          <p className="text-lg font-bold font-mono">
            {market ? formatLargeNumber(market.total_market_cap) : "-"}
          </p>
          {market && (
            <p className={`text-xs font-mono ${market.market_cap_change_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatPercentage(market.market_cap_change_24h)}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("market.totalVolume")}</p>
          <p className="text-lg font-bold font-mono">
            {market ? formatLargeNumber(market.total_volume) : "-"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("market.btcDominance")}</p>
          <p className="text-lg font-bold font-mono">
            {market ? `${market.btc_dominance.toFixed(1)}%` : "-"}
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground mb-2">{t("market.fearGreed")}</p>
          {fgLoading ? (
            <Skeleton className="h-16 w-24" />
          ) : fearGreed ? (
            <FearGreedGauge
              value={fearGreed.value}
              classification={fearGreed.value_classification}
            />
          ) : (
            <p className="text-muted-foreground">-</p>
          )}
        </Card>
      </div>

      {/* Top gainers + losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t("market.topGainers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {(market?.top_gainers || []).map((coin) => (
                <CoinRow key={coin.id} coin={coin} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              {t("market.topLosers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {(market?.top_losers || []).map((coin) => (
                <CoinRow key={coin.id} coin={coin} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Market Analysis */}
      {market?.ai_comment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {t("market.aiAnalysis")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === "tr"
                  ? market.ai_comment.comment_tr
                  : market.ai_comment.comment_en}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
