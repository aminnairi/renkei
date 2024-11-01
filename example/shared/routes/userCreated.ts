import { createEventRoute, z } from "@superblue/core";

export const [userCreatedRoute, implementUserCreated] = createEventRoute({
  output: z.object({
    identifier: z.string(),
    firstname: z.string(),
    lastname: z.string()
  })
});