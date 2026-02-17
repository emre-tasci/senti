"use client";

import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLocale } from "./LocaleProvider";
import type { SentimentDimension } from "@/types";

interface SentimentDimensionsProps {
  dimensions: {
    news_sentiment: SentimentDimension;
    technical_outlook: SentimentDimension;
    social_buzz: SentimentDimension;
    market_context: SentimentDimension;
  };
}

export function SentimentDimensions({ dimensions }: SentimentDimensionsProps) {
  const { t, locale } = useLocale();

  const data = useMemo(
    () => [
      {
        subject: t("sentiment.news_dimension"),
        score: dimensions.news_sentiment.score,
        driver: locale === "tr" ? dimensions.news_sentiment.key_driver_tr : dimensions.news_sentiment.key_driver_en,
      },
      {
        subject: t("sentiment.technical_dimension"),
        score: dimensions.technical_outlook.score,
        driver: locale === "tr" ? dimensions.technical_outlook.key_driver_tr : dimensions.technical_outlook.key_driver_en,
      },
      {
        subject: t("sentiment.social_dimension"),
        score: dimensions.social_buzz.score,
        driver: locale === "tr" ? dimensions.social_buzz.key_driver_tr : dimensions.social_buzz.key_driver_en,
      },
      {
        subject: t("sentiment.market_dimension"),
        score: dimensions.market_context.score,
        driver: locale === "tr" ? dimensions.market_context.key_driver_tr : dimensions.market_context.key_driver_en,
      },
    ],
    [dimensions, t, locale]
  );

  return (
    <div className="space-y-3">
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ fontSize: 9 }}
              axisLine={false}
              tickCount={3}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, _name: any, entry: any) => [
                `${value}/100 — ${entry?.payload?.driver || ""}`,
                "",
              ]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension details */}
      <div className="grid grid-cols-2 gap-2">
        {data.map((d) => (
          <div key={d.subject} className="text-center">
            <p className="text-[10px] text-muted-foreground">{d.subject}</p>
            <p className="text-sm font-bold">{d.score}</p>
            {d.driver && (
              <p className="text-[10px] text-muted-foreground truncate">{d.driver}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
