"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Landmark,
  DollarSign,
  Dog,
  Network,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { CoinTable } from "@/components/CoinTable";
import { SentimentGauge } from "@/components/SentimentGauge";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorReset } from "@/components/QueryErrorReset";
import { useLocale } from "@/components/LocaleProvider";
import { useCategoryCoins, useCategorySentiment } from "@/hooks/useCategories";
import { getCategoryDef } from "@/lib/categories";
import { formatLargeNumber, formatPercentage } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Landmark,
  DollarSign,
  Dog,
  Network,
  Brain,
};

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { locale, t } = useLocale();
  const [page, setPage] = useState(1);

  const categoryDef = getCategoryDef(categoryId);
  const { data: categories } = useCategories();
  const {
    data: coins,
    isLoading: coinsLoading,
    error: coinsError,
    refetch: refetchCoins,
  } = useCategoryCoins(categoryId, page);
  const { data: sentiment, isLoading: sentimentLoading } =
    useCategorySentiment(categoryId);

  const categoryMarket = categories?.find((c) => c.id === categoryId);
  const Icon = ICON_MAP[categoryDef?.icon || "Layers"] || Layers;
  const name =
    locale === "tr"
      ? categoryDef?.name_tr || categoryId
      : categoryDef?.name_en || categoryId;
  const description =
    locale === "tr"
      ? categoryDef?.description_tr
      : categoryDef?.description_en;

  if (!categoryDef) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Link href="/category">
          <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> {t("categories.back")}
          </Button>
        </Link>
        <p className="text-muted-foreground">{t("error")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/category">
        <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" /> {t("categories.back")}
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl bg-muted ${categoryDef.color}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {categoryMarket && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {t("categories.marketCap")}
            </p>
            <p className="text-lg font-bold font-mono">
              {formatLargeNumber(categoryMarket.market_cap)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {t("categories.volume")}
            </p>
            <p className="text-lg font-bold font-mono">
              {formatLargeNumber(categoryMarket.volume_24h)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {t("categories.change")}
            </p>
            <p
              className={`text-lg font-bold font-mono ${
                categoryMarket.market_cap_change_24h >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatPercentage(categoryMarket.market_cap_change_24h)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {t("categories.coinsCount")}
            </p>
            <p className="text-lg font-bold font-mono">
              {coins?.length ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Sentiment */}
      <div className="rounded-lg border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {t("categories.sentiment")}
        </h2>
        {sentimentLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-28 w-48" />
            <Skeleton className="h-16 w-full max-w-md" />
          </div>
        ) : sentiment ? (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <SentimentGauge
              score={sentiment.overall_score}
              sentiment={sentiment.overall_sentiment}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {locale === "tr"
                  ? sentiment.ai_comment_tr
                  : sentiment.ai_comment_en}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("error")}</p>
        )}
      </div>

      {/* Coins Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {t("categories.coins")}
        </h2>
        {coinsError ? (
          <QueryErrorReset
            error={coinsError}
            onRetry={() => refetchCoins()}
            message={t("error")}
          />
        ) : coinsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <CoinTable
            coins={coins || []}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
