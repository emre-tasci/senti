"use client";

import { Users, MessageCircle, Github, Send, ThumbsUp, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocale } from "./LocaleProvider";
import type { SocialMetrics as SocialMetricsType } from "@/types";

interface SocialMetricsProps {
  metrics: SocialMetricsType;
}

function formatK(num: number | null): string {
  if (num === null) return "—";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function BuzzBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    very_high: "bg-green-500/20 text-green-500",
    high: "bg-lime-500/20 text-lime-500",
    moderate: "bg-yellow-500/20 text-yellow-500",
    low: "bg-orange-500/20 text-orange-500",
    very_low: "bg-gray-500/20 text-gray-400",
    very_active: "bg-green-500/20 text-green-500",
    active: "bg-lime-500/20 text-lime-500",
    inactive: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold ${colors[level] || colors.moderate}`}>
      {level.replace("_", " ")}
    </span>
  );
}

/** Tab-ready content (no Card wrapper) */
export function SocialMetricsContent({ metrics }: SocialMetricsProps) {
  const { t } = useLocale();

  const stats = [
    { label: t("social.twitter"), value: formatK(metrics.twitter_followers), icon: Users },
    { label: t("social.reddit"), value: formatK(metrics.reddit_subscribers), icon: MessageCircle },
    { label: t("social.redditActive"), value: formatK(metrics.reddit_active_users_48h), icon: Users },
    { label: t("social.redditPosts"), value: metrics.reddit_posts_48h !== null && metrics.reddit_posts_48h > 0 ? `${metrics.reddit_posts_48h}` : "—", icon: FileText },
    { label: t("social.telegram"), value: formatK(metrics.telegram_users), icon: Send },
    { label: t("social.github"), value: metrics.github_commits_4w !== null ? `${metrics.github_commits_4w} commits` : "—", icon: Github },
  ].filter((s) => s.value !== "—");

  return (
    <div className="space-y-4">
      {/* Stats grid - bigger numbers */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <stat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-medium font-mono">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Buzz + Dev Activity - bigger badges */}
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">{t("social.buzz")}</p>
          <BuzzBadge level={metrics.social_buzz_level} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">{t("social.devActivity")}</p>
          <BuzzBadge level={metrics.developer_activity} />
        </div>
      </div>

      {/* Crowd Sentiment - wider bar */}
      {metrics.crowd_sentiment_score !== null && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("social.crowd")}</span>
            </div>
            <span className="text-sm font-mono font-medium">{metrics.crowd_sentiment_score}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics.crowd_sentiment_score}%`,
                backgroundColor: metrics.crowd_sentiment_score >= 60 ? "#22c55e" : metrics.crowd_sentiment_score <= 40 ? "#ef4444" : "#eab308",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Original Card-wrapped version for backward compatibility */
export function SocialMetricsCard({ metrics }: SocialMetricsProps) {
  const { t } = useLocale();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t("social.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SocialMetricsContent metrics={metrics} />
      </CardContent>
    </Card>
  );
}
