import { createHttpRoute, z } from "@superblue/core";

export const usersSchema = z.array(z.object({
  identifier: z.string(),
  firstname: z.string(),
  lastname: z.string()
}))

export const getUsersRoute = createHttpRoute({
  request: z.void(),
  response: usersSchema
});

export type Users = z.infer<typeof usersSchema>