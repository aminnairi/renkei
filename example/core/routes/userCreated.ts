import { createEventRoute, z } from "@superblue/core";

export const userCreatedRoute = createEventRoute({
  response: z.object({
    identifier: z.string(),
    firstname: z.string(),
    lastname: z.string()
  })
});