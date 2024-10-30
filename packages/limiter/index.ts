type RateLimiterOptions = {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
};

type RateLimiterResult = {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the window */
  remaining: number;
  /** Time in ms after which the next request can be allowed */
  retryAfter?: number;
};

/** The rateLimiter function returns a closure that tracks request counts */
export const createRateLimiter = (options: RateLimiterOptions) => {
  const { limit, windowMs } = options;
  const timestamps: Map<string, number[]> = new Map();

  return (id: string): RateLimiterResult => {
    const now = Date.now();
    const windowStart = now - windowMs;

    const requestTimes = timestamps.get(id) || [];
    const recentRequests = requestTimes.filter(timestamp => timestamp >= windowStart);

    if (recentRequests.length >= limit) {
      const retryAfter = windowStart + windowMs - recentRequests[0];
      return {
        allowed: false,
        remaining: 0,
        retryAfter
      };
    }

    recentRequests.push(now);
    timestamps.set(id, recentRequests);

    return {
      allowed: true,
      remaining: limit - recentRequests.length
    };
  };
};