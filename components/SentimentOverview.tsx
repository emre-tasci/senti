"use client";

import { Bot } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import type { EmotionalIndicators } from "@/types";

interface SentimentOverviewProps {
  aiComment?: string;
  distribution?: { positive: number; negative: number; neutral: number };
  emotionalIndicators?: EmotionalIndicators;
  confidence?: number;
}

function StackedBar({ distribution }: { distribution: { positive: number; negative: number; neutral: number } }) {
  const { t } = useLocale();
  const total = distribution.positive + distribution.negative + distribution.neutral;
  if (total === 0) return null;

  const segments = [
    { key: "positive", value: distribution.positive, color: "#22c55e", label: t("sentiment.positive") },
    { key: "neutral", value: distribution.neutral, color: "#6b7280", label: t("sentiment.neutral") },
    { key: "negative", value: distribution.negative, color: "#ef4444", label: t("sentiment.negative") },
  ];

  return (
    <div>
      <div className="flex h-3 w-full rounded-full overflow-hidden">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-muted-foreground">{seg.label}</span>
            <span className="text-xs font-medium">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmotionChip({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  const getColor = () => {
    if (value >= 70) return "bg-red-500/15 text-red-400 border-red-500/20";
    if (value >= 50) return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    if (value >= 30) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    return "bg-green-500/15 text-green-400 border-green-500/20";
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getColor()}`}>
      <span>{emoji}</span>
      <span>{label}:</span>
      <span className="font-mono">{value}</span>
    </span>
  );
}

export function SentimentOverview({
  aiComment,
  distribution,
  emotionalIndicators,
  confidence,
}: SentimentOverviewProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-5">
      {/* AI Comment - highlighted with left border */}
      {aiComment && (
        <div className="border-l-4 border-primary bg-muted/50 rounded-r-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">{t("sentiment.aiComment")}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiComment}</p>
        </div>
      )}

      {/* Distribution - stacked horizontal bar */}
      {distribution && <StackedBar distribution={distribution} />}

      {/* Emotional Indicators - chip/pill badges */}
      {emotionalIndicators && (
        <div>
          <h4 className="text-sm font-medium mb-3">{t("emotion.title")}</h4>
          <div className="flex flex-wrap gap-2">
            <EmotionChip emoji="😨" label={t("emotion.fear")} value={emotionalIndicators.fear_level} />
            <EmotionChip emoji="🚀" label={t("emotion.fomo")} value={emotionalIndicators.fomo_level} />
            <EmotionChip emoji="❓" label={t("emotion.uncertainty")} value={emotionalIndicators.uncertainty_level} />
          </div>
        </div>
      )}

      {/* Confidence meter inline */}
      {confidence !== undefined && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{t("sentiment.confidence")}</span>
          <div className="h-2 flex-1 max-w-48 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${confidence}%`,
                backgroundColor: confidence >= 70 ? "#22c55e" : confidence >= 50 ? "#eab308" : "#ef4444",
              }}
            />
          </div>
          <span className="text-xs font-mono font-medium">{confidence}%</span>
        </div>
      )}
    </div>
  );
}
