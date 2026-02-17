import { getCache, setCache } from "./cache";

export interface RedditData {
  subscribers: number | null;
  active_users: number | null;
  posts_48h: number;
  comments_48h: number;
}

function extractSubreddit(url: string | null | undefined): string | null {
  if (!url) return null;
  // e.g. "https://www.reddit.com/r/Bitcoin/" → "Bitcoin"
  const match = url.match(/\/r\/([A-Za-z0-9_]+)/);
  return match ? match[1] : null;
}

async function fetchWithRetry(url: string, retries = 1): Promise<Response> {
  const headers = {
    "User-Agent": "CoinScope/1.0 (crypto sentiment analysis tool)",
    "Accept": "application/json",
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(10000),
      });

      // Rate limited — wait and retry
      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw new Error("Max retries reached");
}

export async function fetchRedditData(subredditUrl: string | null | undefined): Promise<RedditData | null> {
  const subreddit = extractSubreddit(subredditUrl);
  if (!subreddit) return null;

  const cacheKey = `reddit_${subreddit.toLowerCase()}`;
  const cached = getCache<RedditData>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch subreddit about + recent posts in parallel
    const [aboutRes, postsRes] = await Promise.all([
      fetchWithRetry(`https://www.reddit.com/r/${encodeURIComponent(subreddit)}/about.json`),
      fetchWithRetry(`https://www.reddit.com/r/${encodeURIComponent(subreddit)}/new.json?limit=25`),
    ]);

    let subscribers: number | null = null;
    let activeUsers: number | null = null;

    if (aboutRes.ok) {
      const aboutJson = await aboutRes.json();
      const data = aboutJson?.data;
      if (data) {
        subscribers = typeof data.subscribers === "number" ? data.subscribers : null;
        activeUsers = typeof data.accounts_active === "number" ? data.accounts_active
          : typeof data.active_user_count === "number" ? data.active_user_count
          : null;
      }
    } else {
      console.warn(`Reddit about.json returned ${aboutRes.status} for r/${subreddit}`);
    }

    let posts48h = 0;
    let comments48h = 0;

    if (postsRes.ok) {
      const postsJson = await postsRes.json();
      const posts = postsJson?.data?.children ?? [];
      const now = Date.now() / 1000;
      const cutoff48h = now - 48 * 3600;

      for (const post of posts) {
        const pd = post?.data;
        if (!pd) continue;
        if ((pd.created_utc ?? 0) >= cutoff48h) {
          posts48h++;
          comments48h += pd.num_comments ?? 0;
        }
      }
    } else {
      console.warn(`Reddit new.json returned ${postsRes.status} for r/${subreddit}`);
    }

    const result: RedditData = {
      subscribers,
      active_users: activeUsers,
      posts_48h: posts48h,
      comments_48h: comments48h,
    };

    // Cache for 5 minutes
    setCache(cacheKey, result, 300);
    return result;
  } catch (err) {
    console.error(`Reddit fetch error for r/${subreddit}:`, err);
    return null;
  }
}
