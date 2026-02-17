"use client";

import { useLocale } from "./LocaleProvider";

interface SentimentGaugeProps {
  score: number;
  sentiment: "positive" | "negative" | "neutral";
}

export function SentimentGauge({ score, sentiment }: SentimentGaugeProps) {
  const { t } = useLocale();

  const getColor = () => {
    if (score >= 65) return "#22c55e";
    if (score >= 45) return "#eab308";
    return "#ef4444";
  };

  const getSentimentLabel = () => {
    return t(`sentiment.${sentiment}`);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 h-28 overflow-hidden">
        {/* Background arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc based on score */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={100 + 60 * Math.cos(((180 - (score / 100) * 180) * Math.PI) / 180)}
            y2={100 - 60 * Math.sin(((180 - (score / 100) * 180) * Math.PI) / 180)}
            stroke={getColor()}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="4" fill={getColor()} />
          {/* Labels */}
          <text x="15" y="108" className="text-[10px] fill-muted-foreground" textAnchor="start">0</text>
          <text x="97" y="25" className="text-[10px] fill-muted-foreground" textAnchor="middle">50</text>
          <text x="185" y="108" className="text-[10px] fill-muted-foreground" textAnchor="end">100</text>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold" style={{ color: getColor() }}>
          {score}
        </div>
        <div className="text-sm text-muted-foreground">{getSentimentLabel()}</div>
      </div>
    </div>
  );
}
