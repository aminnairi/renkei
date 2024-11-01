import { createClient } from "@example/shared";
import { createHttpClientAdapter } from "@superblue/fetch";

export const client = createClient({
  server: "http://localhost:8000",
  adapter: createHttpClientAdapter()
});