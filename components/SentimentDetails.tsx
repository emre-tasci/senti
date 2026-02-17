"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SentimentDimensions } from "./SentimentDimensions";
import { useLocale } from "./LocaleProvider";
import { formatPrice } from "@/lib/utils";
import type { SentimentDimension } from "@/types";

interface SentimentDetailsProps {
  dimensions?: {
    news_sentiment: SentimentDimension;
    technical_outlook: SentimentDimension;
    social_buzz: SentimentDimension;
    market_context: SentimentDimension;
  };
  riskFactorsTr?: string[];
  riskFactorsEn?: string[];
  keyLevels?: {
    support: number[];
    resistance: number[];
  };
}

export function SentimentDetails({
  dimensions,
  riskFactorsTr,
  riskFactorsEn,
  keyLevels,
}: SentimentDetailsProps) {
  const { t, locale } = useLocale();

  const risks = locale === "tr" ? riskFactorsTr : riskFactorsEn;
  const hasRisks = risks && risks.length > 0;
  const hasKeyLevels = keyLevels && (keyLevels.support.length > 0 || keyLevels.resistance.length > 0);

  return (
    <div className="space-y-6">
      {/* Radar chart - larger */}
      {dimensions && (
        <div>
          <SentimentDimensions dimensions={dimensions} />
        </div>
      )}

      {/* Risk Factors - warning card format */}
      {hasRisks && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            {t("risk.title")}
          </h4>
          <ul className="space-y-2">
            {risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500/70 mt-0.5 shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Levels - support & resistance */}
      {hasKeyLevels && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t("tabs.keyLevels")}</h4>
          {keyLevels.resistance.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-400">{t("ta.resistance")}</span>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {keyLevels.resistance.map((r) => (
                  <Badge key={r} variant="negative" className="text-[11px] font-mono">
                    {formatPrice(r)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {keyLevels.support.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-400">{t("ta.support")}</span>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {keyLevels.support.map((s) => (
                  <Badge key={s} variant="positive" className="text-[11px] font-mono">
                    {formatPrice(s)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
