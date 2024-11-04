import { createApplication } from "@renkei/core";
import { createUserRoute } from "./routes/createUser";
import { getUsersRoute } from "./routes/getUsers";
import { userCreatedRoute } from "./routes/userCreated";

export const { createClient, createServer } = createApplication({
  routes: {
    createUser: createUserRoute,
    getUsers: getUsersRoute,
    userCreated: userCreatedRoute
  },
});