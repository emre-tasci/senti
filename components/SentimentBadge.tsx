import { Badge } from "@/components/ui/badge";

interface SentimentBadgeProps {
  sentiment: "positive" | "negative" | "neutral";
  score?: number;
}

export function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const label = score !== undefined ? `${sentiment} (${score})` : sentiment;

  return (
    <Badge variant={sentiment}>
      {label}
    </Badge>
  );
}
