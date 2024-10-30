import { createRateLimiter } from "@superblue/limiter";

export const limit = createRateLimiter({ limit: 1, windowMs: 60000 }); // 10 requests per minute
