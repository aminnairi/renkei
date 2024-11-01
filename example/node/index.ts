import { createServer } from "@example/shared"
import { createNodeHttpServerAdapter } from "@superblue/server";

import { createUserImplementation } from "./implementations/createUser";
import { getUsersImplementation } from "./implementations/getUsers";
import { userCreatedImplementation } from "./implementations/userCreated";

const server = createServer({
  adapter: createNodeHttpServerAdapter({
    clients: ["http://localhost:5173"]
  }),
  implementations: {
    createUser: createUserImplementation,
    getUsers: getUsersImplementation,
    userCreated: userCreatedImplementation
  }
});

server.start({ port: 8000, host: "0.0.0.0"});