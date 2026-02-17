"use client";

import Link from "next/link";
import {
  Layers,
  Landmark,
  DollarSign,
  Dog,
  Network,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { formatLargeNumber, formatPercentage } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Landmark,
  DollarSign,
  Dog,
  Network,
  Brain,
};

interface CategoryCardProps {
  id: string;
  name_tr: string;
  name_en: string;
  icon: string;
  color: string;
  market_cap: number;
  market_cap_change_24h: number;
  top_3_coins: string[];
}

export function CategoryCard({
  id,
  name_tr,
  name_en,
  icon,
  color,
  market_cap,
  market_cap_change_24h,
  top_3_coins,
}: CategoryCardProps) {
  const { locale, t } = useLocale();
  const Icon = ICON_MAP[icon] || Layers;
  const name = locale === "tr" ? name_tr : name_en;
  const changePositive = market_cap_change_24h >= 0;

  return (
    <Link href={`/category/${id}`}>
      <div className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors cursor-pointer h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm">{name}</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("categories.marketCap")}
            </span>
            <span className="text-xs font-mono font-medium">
              {formatLargeNumber(market_cap)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("categories.change")}
            </span>
            <span
              className={`text-xs font-mono font-medium ${
                changePositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatPercentage(market_cap_change_24h)}
            </span>
          </div>

          {top_3_coins.length > 0 && (
            <div className="flex items-center gap-1 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {top_3_coins.slice(0, 3).map((imgUrl, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={imgUrl}
                  alt=""
                  className="h-5 w-5 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
