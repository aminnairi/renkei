import { createLimiter } from "@superblue/limiter";

// 1 request per 10 seconds
export const limit = createLimiter({
  requestsPerWindow: 1,
  windowInSeconds: 10 
});