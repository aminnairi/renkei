import { createClient } from "@example/shared";
import { createFetchAdapter } from "@superblue/fetch";

export const client = createClient({
  server: "http://localhost:8000",
  adapter: createFetchAdapter()
});