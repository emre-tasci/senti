"use client";

import { useLocale } from "./LocaleProvider";
import type { SentimentDimension } from "@/types";

interface SentimentHeroProps {
  score: number;
  sentiment: string;
  confidence?: number;
  signalAlignment?: string;
  dimensions?: {
    news_sentiment: SentimentDimension;
    technical_outlook: SentimentDimension;
    social_buzz: SentimentDimension;
    market_context: SentimentDimension;
  };
  aiSummary?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 65) return "#22c55e";
  if (score >= 55) return "#84cc16";
  if (score >= 45) return "#eab308";
  if (score >= 35) return "#f97316";
  if (score >= 20) return "#ef4444";
  return "#dc2626";
}

function DimensionBar({ label, score }: { label: string; score: number }) {
  const color = getScoreColor(score);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-muted-foreground truncate w-20 shrink-0">{label}</span>
      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono font-medium w-8 text-right shrink-0">{score}</span>
    </div>
  );
}

export function SentimentHero({
  score,
  sentiment,
  confidence,
  signalAlignment,
  dimensions,
  aiSummary,
}: SentimentHeroProps) {
  const { t } = useLocale();

  const color = getScoreColor(score);

  const getSentimentLabel = () => {
    const enhanced = t(`sentiment.${sentiment}`);
    return enhanced !== `sentiment.${sentiment}` ? enhanced : sentiment;
  };

  const getAlignmentText = () => {
    if (!signalAlignment) return null;
    return t(`sentiment.alignment.${signalAlignment}`);
  };

  // SVG donut ring parameters
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Donut ring + score */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-700"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground">{getSentimentLabel()}</span>
        </div>
      </div>

      {/* Confidence + Signal alignment */}
      <div className="flex items-center gap-3 text-sm">
        {confidence !== undefined && (
          <span className="text-muted-foreground">
            {t("sentiment.confidence")}: {confidence}%
          </span>
        )}
        {signalAlignment && (
          <span className="text-muted-foreground">
            {getAlignmentText()}
          </span>
        )}
      </div>

      {/* 4-dimension mini bars */}
      {dimensions && (
        <div className="w-full max-w-sm space-y-2 px-2">
          <DimensionBar label={t("sentiment.news_dimension")} score={dimensions.news_sentiment.score} />
          <DimensionBar label={t("sentiment.technical_dimension")} score={dimensions.technical_outlook.score} />
          <DimensionBar label={t("sentiment.social_dimension")} score={dimensions.social_buzz.score} />
          <DimensionBar label={t("sentiment.market_dimension")} score={dimensions.market_context.score} />
        </div>
      )}

      {/* AI summary */}
      {aiSummary && (
        <p className="text-sm text-muted-foreground text-center max-w-lg px-4 leading-relaxed">
          {aiSummary}
        </p>
      )}
    </div>
  );
}

// Keep backward compat export name
export { SentimentHero as SentimentGauge };
