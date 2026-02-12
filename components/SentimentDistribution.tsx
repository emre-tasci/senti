"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLocale } from "./LocaleProvider";

interface SentimentDistributionProps {
  distribution: { positive: number; negative: number; neutral: number };
}

const COLORS = ["#22c55e", "#ef4444", "#6b7280"];

export function SentimentDistribution({ distribution }: SentimentDistributionProps) {
  const { t } = useLocale();

  const data = [
    { name: t("sentiment.positive"), value: distribution.positive },
    { name: t("sentiment.negative"), value: distribution.negative },
    { name: t("sentiment.neutral"), value: distribution.neutral },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="w-[120px] h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}%`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
