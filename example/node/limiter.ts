import { createRateLimiter } from "@superblue/limiter";

export const limiter = createRateLimiter({ limit: 1, windowMs: 60000 }); // 10 requests per minute
