import { createServerSentEventRoute, z } from "@superblue/core";

export const userCreatedRoute = createServerSentEventRoute({
  response: z.object({
    identifier: z.string(),
    firstname: z.string(),
    lastname: z.string()
  })
})