import { createApplication } from "@superblue/core";
import { createUserRoute } from "./routes/createUser";
import { getUsersRoute } from "./routes/getUsers";

export const { createClient, createHandler, createImplementation } = createApplication({
  createUser: createUserRoute,
  getUsers: getUsersRoute
});
