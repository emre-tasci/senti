"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorReset } from "@/components/QueryErrorReset";
import { useLocale } from "@/components/LocaleProvider";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  const { t } = useLocale();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!categories) return [];
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name_tr.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> {t("categories.back")}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t("categories.title")}</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("categories.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error ? (
        <QueryErrorReset error={error} onRetry={() => refetch()} message={t("error")} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
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
      )}
    </div>
  );
}
