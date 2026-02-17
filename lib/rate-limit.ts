const windowMs = 60_000;
const maxRequests = 30;

const hits = new Map<string, number[]>();

export function rateLimit(request: Request): { limited: boolean } {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";

  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = hits.get(ip) || [];
  timestamps = timestamps.filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(ip, timestamps);

  // Periodically clean up old entries
  if (hits.size > 1000) {
    hits.forEach((val, key) => {
      const filtered = val.filter((t) => t > windowStart);
      if (filtered.length === 0) hits.delete(key);
      else hits.set(key, filtered);
    });
  }

  return { limited: timestamps.length > maxRequests };
}
