import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentBadgeProps {
  sentiment: "positive" | "negative" | "neutral";
  score?: number;
}

const icons = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
};

const labels = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
};

export function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const Icon = icons[sentiment];
  const text = score !== undefined ? `${labels[sentiment]} (${score})` : labels[sentiment];

  return (
    <Badge variant={sentiment} className="gap-1">
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}
