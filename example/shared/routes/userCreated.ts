import { createEventRoute } from "@renkei/core";
import { z } from "zod";

export const [userCreatedRoute, implementUserCreated] = createEventRoute({
  output: z.object({
    identifier: z.string(),
    firstname: z.string(),
    lastname: z.string()
  }).parse
});