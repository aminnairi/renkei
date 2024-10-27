import { createRoute, z } from "@superblue/core";

export const createUserRoute = createRoute({
  request: z.object({
    firstname: z.string(),
    lastname: z.string()
  }),
  response: z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      message: z.string()
    }),
    z.object({
      success: z.literal(false),
      error: z.string()
    })
  ])
})