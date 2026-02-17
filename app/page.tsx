"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoinTable } from "@/components/CoinTable";
import { CategoryCard } from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorReset } from "@/components/QueryErrorReset";
import { AlertNotification } from "@/components/AlertNotification";
import { useLocale } from "@/components/LocaleProvider";
import { useCoins } from "@/hooks/useCoins";
import { useCategories } from "@/hooks/useCategories";
import { useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const { data: coins, isLoading, error, refetch } = useCoins(page);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { triggered, checkAlerts, dismissTriggered } = useAlerts();

  useEffect(() => {
    if (coins && coins.length > 0) {
      checkAlerts(coins);
    }
  }, [coins, checkAlerts]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("site.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("site.subtitle")}</p>
      </div>

      <AlertNotification triggered={triggered} onDismiss={dismissTriggered} />

      {/* Categories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("categories.title")}</h2>
          <Link href="/category">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              {t("categories.showAll")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(0, 3).map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name_tr={cat.name_tr}
                name_en={cat.name_en}
                icon={cat.icon}
                color={cat.color}
                market_cap={cat.market_cap}
                market_cap_change_24h={cat.market_cap_change_24h}
                top_3_coins={cat.top_3_coins}
              />
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <QueryErrorReset error={error} onRetry={() => refetch()} message={t("error")} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <CoinTable coins={coins || []} page={page} onPageChange={setPage} />
      )}
    </div>
  );
}
