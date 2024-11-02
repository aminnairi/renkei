import { createServer } from "@example/shared"
import { createNodeHttpServerAdapter, gzipCompression } from "@superblue/node";

import { createUserImplementation } from "./implementations/createUser";
import { getUsersImplementation } from "./implementations/getUsers";
import { userCreatedImplementation } from "./implementations/userCreated";

const server = createServer({
  adapter: createNodeHttpServerAdapter({
    clients: ["http://localhost:5173"],
    compression: gzipCompression({
      exceptions: ["text/event-stream"]
    })
  }),
  implementations: {
    createUser: createUserImplementation,
    getUsers: getUsersImplementation,
    userCreated: userCreatedImplementation
  }
});

server.start({ port: 8000, host: "0.0.0.0"});