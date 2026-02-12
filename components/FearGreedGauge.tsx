"use client";

import { useLocale } from "./LocaleProvider";

interface FearGreedGaugeProps {
  value: number;
  classification: string;
}

export function FearGreedGauge({ value, classification }: FearGreedGaugeProps) {
  const { t } = useLocale();

  const getColor = () => {
    if (value <= 20) return "#ef4444";
    if (value <= 40) return "#f97316";
    if (value <= 60) return "#eab308";
    if (value <= 80) return "#84cc16";
    return "#22c55e";
  };

  const getLabel = () => {
    const key = classification.toLowerCase().replace(/ /g, "_");
    return t(`fear.${key}`) || classification;
  };

  const angle = ((value / 100) * 180) - 90;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-44 h-24 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Gradient arc: red -> yellow -> green */}
          <defs>
            <linearGradient id="fgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#fgGradient)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={100 + 55 * Math.cos((angle * Math.PI) / 180)}
            y2={100 - 55 * Math.sin((-angle * Math.PI) / 180)}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="4" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: getColor() }}>
          {value}
        </div>
        <div className="text-sm text-muted-foreground">{getLabel()}</div>
      </div>
    </div>
  );
}
