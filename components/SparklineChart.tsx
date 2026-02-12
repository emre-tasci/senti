"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  positive: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  if (!data || data.length === 0) return null;

  // Downsample to ~20 points for sparkline
  const step = Math.max(1, Math.floor(data.length / 20));
  const chartData = data
    .filter((_, i) => i % step === 0)
    .map((value) => ({ value }));

  return (
    <div className="w-[100px] h-[32px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={positive ? "hsl(142, 76%, 46%)" : "hsl(0, 84%, 60%)"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
