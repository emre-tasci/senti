"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpDown } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { SparklineChart } from "./SparklineChart";
import { formatPrice, formatLargeNumber, formatPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Coin } from "@/types";

interface CoinTableProps {
  coins: Coin[];
  page: number;
  onPageChange: (page: number) => void;
}

type SortField = "market_cap_rank" | "current_price" | "price_change_percentage_24h" | "market_cap" | "total_volume";

export function CoinTable({ coins, page, onPageChange }: CoinTableProps) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("market_cap_rank");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let result = coins;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [coins, search, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "market_cap_rank");
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </th>
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <SortHeader field="market_cap_rank" label="#" />
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Coin</th>
              <SortHeader field="current_price" label={t("coin.price")} />
              <SortHeader field="price_change_percentage_24h" label={t("coin.change24h")} />
              <SortHeader field="market_cap" label={t("coin.marketCap")} />
              <SortHeader field="total_volume" label={t("coin.volume")} />
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                {t("coin.7dTrend")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((coin) => (
              <tr key={coin.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-3 text-muted-foreground">{coin.market_cap_rank}</td>
                <td className="px-3 py-3">
                  <Link href={`/coin/${coin.id}`} className="flex items-center gap-2 hover:underline">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-muted-foreground uppercase text-xs">{coin.symbol}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 font-mono">{formatPrice(coin.current_price)}</td>
                <td className="px-3 py-3">
                  <span
                    className={`font-mono font-medium ${
                      (coin.price_change_percentage_24h ?? 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {formatLargeNumber(coin.market_cap)}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">
                  {formatLargeNumber(coin.total_volume)}
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  {coin.sparkline_in_7d?.price && (
                    <SparklineChart
                      data={coin.sparkline_in_7d.price}
                      positive={(coin.price_change_percentage_24h ?? 0) >= 0}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {t("pagination.prev")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("pagination.page")} {page}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={filtered.length < 50}
        >
          {t("pagination.next")}
        </Button>
      </div>
    </div>
  );
}
