"use client";

import { ExternalLink } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "./LocaleProvider";
import { timeAgo } from "@/lib/utils";
import type { SentimentResult, NewsItem } from "@/types";

interface NewsCardProps {
  news: NewsItem;
  sentimentResult?: SentimentResult;
}

export function NewsCard({ news, sentimentResult }: NewsCardProps) {
  const { locale } = useLocale();

  const summary = sentimentResult
    ? locale === "tr"
      ? sentimentResult.summary_tr
      : sentimentResult.summary_en
    : null;

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {sentimentResult && (
                <SentimentBadge
                  sentiment={sentimentResult.sentiment}
                  score={sentimentResult.score}
                />
              )}
              <span className="text-xs text-muted-foreground">
                {news.source.title} &middot; {timeAgo(news.published_at)}
              </span>
            </div>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline flex items-center gap-1"
            >
              {news.title}
              {news.url !== "#" && <ExternalLink className="h-3 w-3 flex-shrink-0" />}
            </a>
            {summary && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {summary}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
