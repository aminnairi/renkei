import { createClient } from "@example/shared";
import { createHttpClientAdapter } from "@superblue/client";

export const client = createClient({
  server: "http://localhost:8000",
  adapter: createHttpClientAdapter()
});