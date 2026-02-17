"use client";

import { useLocale } from "./LocaleProvider";
import type { EmotionalIndicators as EmotionalIndicatorsType } from "@/types";

interface EmotionalIndicatorsProps {
  indicators: EmotionalIndicatorsType;
}

function IndicatorBar({ label, value, colorHigh, colorLow }: {
  label: string;
  value: number;
  colorHigh: string;
  colorLow: string;
}) {
  // Interpolate color based on value
  const color = value >= 60 ? colorHigh : value <= 40 ? colorLow : "#eab308";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-medium">{value}/100</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function EmotionalIndicatorsCard({ indicators }: EmotionalIndicatorsProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">{t("emotion.title")}</h4>
      <IndicatorBar
        label={t("emotion.fear")}
        value={indicators.fear_level}
        colorHigh="#ef4444"
        colorLow="#22c55e"
      />
      <IndicatorBar
        label={t("emotion.fomo")}
        value={indicators.fomo_level}
        colorHigh="#f97316"
        colorLow="#6b7280"
      />
      <IndicatorBar
        label={t("emotion.uncertainty")}
        value={indicators.uncertainty_level}
        colorHigh="#ef4444"
        colorLow="#22c55e"
      />
    </div>
  );
}
