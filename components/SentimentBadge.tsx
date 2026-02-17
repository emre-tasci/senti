import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentBadgeProps {
  sentiment: string;
  score?: number;
}

export function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const isPositive = sentiment.includes("bullish") || sentiment === "positive";
  const isNegative = sentiment.includes("bearish") || sentiment === "negative";
  const variant = isPositive ? "positive" : isNegative ? "negative" : "neutral";
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const label = sentiment.replace("_", " ").replace("strongly ", "");
  const text = score !== undefined ? `${label} (${score})` : label;

  return (
    <Badge variant={variant} className="gap-1 capitalize">
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}
