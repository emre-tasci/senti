"use client";

import { useState } from "react";
import { Activity, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "./LocaleProvider";
import { formatPrice } from "@/lib/utils";
import type { TechnicalSignals as TechnicalSignalsType } from "@/types";

interface TechnicalSignalsProps {
  signals: TechnicalSignalsType;
}

function SignalBadge({ signal }: { signal: string }) {
  const variant = signal.includes("bullish") ? "positive" : signal.includes("bearish") ? "negative" : "neutral";
  const Icon = signal.includes("bullish") ? TrendingUp : signal.includes("bearish") ? TrendingDown : Minus;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {signal.replace("_", " ")}
    </Badge>
  );
}

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function getRSIColor(value: number): string {
  if (value >= 70) return "#ef4444";
  if (value >= 60) return "#f97316";
  if (value <= 30) return "#22c55e";
  if (value <= 40) return "#84cc16";
  return "#eab308";
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[11px] bg-popover text-popover-foreground border border-border rounded shadow-md whitespace-nowrap z-50">
          {text}
        </span>
      )}
    </span>
  );
}

function countSignals(signals: TechnicalSignalsType) {
  let bullish = 0;
  let bearish = 0;
  let neutral = 0;

  // RSI
  if (signals.rsi_14 !== null) {
    if (signals.rsi_signal === "oversold") bullish++;
    else if (signals.rsi_signal === "overbought") bearish++;
    else neutral++;
  }

  // MACD
  if (signals.macd) {
    if (signals.macd.signal === "bullish") bullish++;
    else if (signals.macd.signal === "bearish") bearish++;
    else neutral++;
  }

  // SMA20
  if (signals.moving_averages.sma_20 !== null) {
    if (signals.moving_averages.price_vs_sma20 === "above") bullish++;
    else bearish++;
  }

  // SMA50
  if (signals.moving_averages.sma_50 !== null) {
    if (signals.moving_averages.price_vs_sma50 === "above") bullish++;
    else bearish++;
  }

  // Golden/Death cross
  if (signals.moving_averages.golden_cross) bullish++;
  if (signals.moving_averages.death_cross) bearish++;

  // Volume
  if (signals.volume_analysis) {
    if (signals.volume_analysis.volume_trend === "increasing") bullish++;
    else if (signals.volume_analysis.volume_trend === "decreasing") bearish++;
    else neutral++;
  }

  // Bollinger
  if (signals.bollinger_bands) {
    if (signals.bollinger_bands.position === "below_lower" || signals.bollinger_bands.position === "near_lower") bullish++;
    else if (signals.bollinger_bands.position === "above_upper" || signals.bollinger_bands.position === "near_upper") bearish++;
    else neutral++;
  }

  return { bullish, bearish, neutral };
}

/** Tab-ready content (no Card wrapper) */
export function TechnicalSignalsContent({ signals }: TechnicalSignalsProps) {
  const { t } = useLocale();
  const counts = countSignals(signals);

  return (
    <div className="space-y-4">
      {/* Signal Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="positive" className="gap-1 text-xs">
          <TrendingUp className="h-3 w-3" />
          {counts.bullish} {t("tabs.signalBullish")}
        </Badge>
        <Badge variant="negative" className="gap-1 text-xs">
          <TrendingDown className="h-3 w-3" />
          {counts.bearish} {t("tabs.signalBearish")}
        </Badge>
        <Badge variant="neutral" className="gap-1 text-xs">
          <Minus className="h-3 w-3" />
          {counts.neutral} {t("tabs.signalNeutral")}
        </Badge>
      </div>

      {/* Overall Signal */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("ta.overall")}</span>
        <SignalBadge signal={signals.overall_signal} />
      </div>

      {/* RSI */}
      {signals.rsi_14 !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              {t("ta.rsi")}
              <Tooltip text={t("ta.rsiTooltip")} />
            </span>
            <span className="text-xs font-mono font-medium">{signals.rsi_14}</span>
          </div>
          {/* RSI bar with zone labels */}
          <div className="relative">
            <MiniBar value={signals.rsi_14} color={getRSIColor(signals.rsi_14)} />
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-green-500 font-medium">{t("ta.oversold")}</span>
              <span className="text-[11px] text-muted-foreground">{t("ta.rsiNormal")}</span>
              <span className="text-[11px] text-red-500 font-medium">{t("ta.overbought")}</span>
            </div>
            {/* Zone markers */}
            <div className="absolute top-0 left-[30%] h-2 border-l border-dashed border-muted-foreground/30" />
            <div className="absolute top-0 left-[70%] h-2 border-l border-dashed border-muted-foreground/30" />
          </div>
        </div>
      )}

      {/* MACD */}
      {signals.macd && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            {t("ta.macd")}
            <Tooltip text={t("ta.macdTooltip")} />
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${signals.macd.histogram >= 0 ? "text-green-500" : "text-red-500"}`}>
              {signals.macd.histogram > 0 ? "+" : ""}{signals.macd.histogram}
            </span>
            <SignalBadge signal={signals.macd.signal} />
          </div>
        </div>
      )}

      {/* Moving Averages */}
      <div className="space-y-1.5">
        {signals.moving_averages.sma_20 !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("ta.sma20")}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono">{formatPrice(signals.moving_averages.sma_20)}</span>
              <span className={`text-[10px] ${signals.moving_averages.price_vs_sma20 === "above" ? "text-green-500" : "text-red-500"}`}>
                {signals.moving_averages.price_vs_sma20 === "above" ? "▲" : "▼"}
              </span>
            </div>
          </div>
        )}
        {signals.moving_averages.sma_50 !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("ta.sma50")}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono">{formatPrice(signals.moving_averages.sma_50)}</span>
              <span className={`text-[10px] ${signals.moving_averages.price_vs_sma50 === "above" ? "text-green-500" : "text-red-500"}`}>
                {signals.moving_averages.price_vs_sma50 === "above" ? "▲" : "▼"}
              </span>
            </div>
          </div>
        )}
        {signals.moving_averages.golden_cross && (
          <Badge variant="positive" className="text-[10px]">Golden Cross</Badge>
        )}
        {signals.moving_averages.death_cross && (
          <Badge variant="negative" className="text-[10px]">Death Cross</Badge>
        )}
      </div>

      {/* Bollinger */}
      {signals.bollinger_bands && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            {t("ta.bollinger")}
            <Tooltip text={t("ta.bollingerTooltip")} />
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {signals.bollinger_bands.position.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Volume */}
      {signals.volume_analysis && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t("ta.volume")}</span>
          <span className={`text-xs font-mono ${
            signals.volume_analysis.volume_trend === "increasing" ? "text-green-500" :
            signals.volume_analysis.volume_trend === "decreasing" ? "text-red-500" : "text-muted-foreground"
          }`}>
            {signals.volume_analysis.volume_trend} ({signals.volume_analysis.volume_change_pct > 0 ? "+" : ""}{signals.volume_analysis.volume_change_pct}%)
          </span>
        </div>
      )}

      {/* Support / Resistance - with colored badges */}
      {(signals.support_resistance.support.length > 0 || signals.support_resistance.resistance.length > 0) && (
        <div className="border-t pt-3 space-y-2">
          {signals.support_resistance.resistance.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-400">{t("ta.resistance")}</span>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {signals.support_resistance.resistance.map((r) => (
                  <Badge key={r} variant="negative" className="text-[11px] font-mono">
                    {formatPrice(r)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {signals.support_resistance.support.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-400">{t("ta.support")}</span>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {signals.support_resistance.support.map((s) => (
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

/** Original Card-wrapped version for backward compatibility */
export function TechnicalSignalsCard({ signals }: TechnicalSignalsProps) {
  const { t } = useLocale();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t("ta.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TechnicalSignalsContent signals={signals} />
      </CardContent>
    </Card>
  );
}
