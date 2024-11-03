import { createHttpRoute } from "@superblue/core";
import { z } from "zod";

export const usersSchema = z.array(z.object({
  identifier: z.string(),
  firstname: z.string(),
  lastname: z.string()
}))

export const [getUsersRoute, implementGetUsers] = createHttpRoute({
  input: value => z.null().parse(value),
  output: value => usersSchema.parse(value)
});

export type Users = z.infer<typeof usersSchema>