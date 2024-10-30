import { createApplication } from "@superblue/core";
import { createUserRoute } from "./routes/createUser";
import { getUsersRoute } from "./routes/getUsers";
import { userCreatedRoute } from "./routes/userCreated";

export const { createClient, createRequestListener, createHttpImplementation, createEventImplementation } = createApplication({
  createUser: createUserRoute,
  getUsers: getUsersRoute,
  userCreated: userCreatedRoute
});
