import type { CoinDetail, NewsItem, SocialMetrics } from "@/types";
import type { RedditData } from "./reddit";

export function extractSocialMetrics(
  detail: CoinDetail,
  news: NewsItem[],
  redditData?: RedditData | null,
): SocialMetrics {
  const cd = detail.community_data;
  const dd = detail.developer_data;

  // Twitter / Telegram / GitHub raw values
  const twitterFollowers = cd?.twitter_followers ?? null;
  const telegramUsers = cd?.telegram_channel_user_count ?? null;
  const githubStars = dd?.stars ?? null;
  const githubForks = dd?.forks ?? null;
  const githubCommits = dd?.commit_count_4_weeks ?? null;

  // Reddit: prefer direct Reddit API data, fall back to CoinGecko (which is often 0)
  const cgRedditSubs = cd?.reddit_subscribers ?? null;
  const cgRedditActive = cd?.reddit_accounts_active_48h ?? null;
  const cgRedditPosts = cd?.reddit_average_posts_48h ?? null;
  const cgRedditComments = cd?.reddit_average_comments_48h ?? null;

  const redditSubscribers = (redditData?.subscribers && redditData.subscribers > 0)
    ? redditData.subscribers
    : (cgRedditSubs && cgRedditSubs > 0) ? cgRedditSubs : null;

  const redditActive = (redditData?.active_users && redditData.active_users > 0)
    ? redditData.active_users
    : (cgRedditActive && cgRedditActive > 0) ? cgRedditActive : null;

  const redditPosts = (redditData && redditData.posts_48h > 0)
    ? redditData.posts_48h
    : (cgRedditPosts && cgRedditPosts > 0) ? cgRedditPosts : null;

  const redditComments = (redditData && redditData.comments_48h > 0)
    ? redditData.comments_48h
    : (cgRedditComments && cgRedditComments > 0) ? cgRedditComments : null;

  // Social buzz level based on combined social activity
  const socialScore =
    (twitterFollowers ? Math.min(twitterFollowers / 100000, 5) : 0) +
    (redditActive ? Math.min(redditActive / 5000, 5) : 0) +
    (redditSubscribers ? Math.min(redditSubscribers / 500000, 3) : 0) +
    (telegramUsers ? Math.min(telegramUsers / 50000, 3) : 0);

  let socialBuzz: SocialMetrics["social_buzz_level"];
  if (socialScore >= 8) socialBuzz = "very_high";
  else if (socialScore >= 5) socialBuzz = "high";
  else if (socialScore >= 2) socialBuzz = "moderate";
  else if (socialScore >= 0.5) socialBuzz = "low";
  else socialBuzz = "very_low";

  // Developer activity
  let devActivity: SocialMetrics["developer_activity"];
  if (githubCommits !== null) {
    if (githubCommits >= 100) devActivity = "very_active";
    else if (githubCommits >= 40) devActivity = "active";
    else if (githubCommits >= 10) devActivity = "moderate";
    else if (githubCommits >= 1) devActivity = "low";
    else devActivity = "inactive";
  } else {
    devActivity = "inactive";
  }

  // Community size
  const totalCommunity = (twitterFollowers ?? 0) + (redditSubscribers ?? 0) + (telegramUsers ?? 0);
  let communitySize: SocialMetrics["community_size"];
  if (totalCommunity >= 5000000) communitySize = "massive";
  else if (totalCommunity >= 500000) communitySize = "large";
  else if (totalCommunity >= 50000) communitySize = "medium";
  else if (totalCommunity >= 5000) communitySize = "small";
  else communitySize = "tiny";

  // Crowd sentiment from CryptoPanic votes
  let crowdScore: number | null = null;
  let crowdSentiment: SocialMetrics["crowd_sentiment"] = null;

  const totalPositive = news.reduce((sum, n) => sum + (n.votes?.positive ?? 0), 0);
  const totalNegative = news.reduce((sum, n) => sum + (n.votes?.negative ?? 0), 0);
  const totalVotes = totalPositive + totalNegative;

  if (totalVotes >= 3) {
    crowdScore = Math.round((totalPositive / totalVotes) * 100);
    if (crowdScore >= 60) crowdSentiment = "positive";
    else if (crowdScore <= 40) crowdSentiment = "negative";
    else crowdSentiment = "neutral";
  }

  return {
    twitter_followers: twitterFollowers,
    reddit_subscribers: redditSubscribers,
    reddit_active_users_48h: redditActive,
    reddit_posts_48h: redditPosts,
    reddit_comments_48h: redditComments,
    telegram_users: telegramUsers,
    github_stars: githubStars,
    github_forks: githubForks,
    github_commits_4w: githubCommits,
    social_buzz_level: socialBuzz,
    developer_activity: devActivity,
    community_size: communitySize,
    crowd_sentiment_score: crowdScore,
    crowd_sentiment: crowdSentiment,
  };
}
