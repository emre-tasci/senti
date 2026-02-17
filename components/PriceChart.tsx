"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "./LocaleProvider";
import { formatPrice } from "@/lib/utils";
import { useCoinDetail } from "@/hooks/useCoins";

interface PriceChartProps {
  coinId: string;
  initialDays?: string;
}

const PERIODS = [
  { key: "7", label: "chart.7d" },
  { key: "30", label: "chart.30d" },
  { key: "90", label: "chart.90d" },
  { key: "365", label: "chart.1y" },
];

export function PriceChart({ coinId, initialDays = "7" }: PriceChartProps) {
  const { t } = useLocale();
  const [period, setPeriod] = useState(initialDays);
  const { data, isLoading } = useCoinDetail(coinId, period);
  const history = data?.history ?? null;

  const chartData = useMemo(
    () =>
      (history?.prices || []).map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price,
      })),
    [history]
  );

  const isPositive = useMemo(
    () =>
      chartData.length > 1 &&
      chartData[chartData.length - 1].price >= chartData[0].price,
    [chartData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{t("chart.price")}</CardTitle>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setPeriod(p.key)}
            >
              {t(p.label)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "#22c55e" : "#ef4444"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "#22c55e" : "#ef4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => formatPrice(v)}
                  width={80}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [formatPrice(Number(value)), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
