"use client";

import { useEffect, useState } from "react";
import { CoinTable } from "@/components/CoinTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/LocaleProvider";
import type { Coin } from "@/types";

export default function HomePage() {
  const { t } = useLocale();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/coins?page=${page}&per_page=50`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        setCoins(data);
      })
      .catch((err) => {
        console.error(err);
        setError(t("error"));
      })
      .finally(() => setLoading(false));
  }, [page, t]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("site.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("site.subtitle")}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <CoinTable coins={coins} page={page} onPageChange={setPage} />
      )}
    </div>
  );
}
