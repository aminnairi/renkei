import { createClient } from "@example/shared";
import { createFetchAdapter } from "@renkei/fetch";

export const client = createClient({
  server: "http://localhost:8000",
  adapter: createFetchAdapter()
});