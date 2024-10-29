import { createHandler } from "@superblue/example-core";
import { createServer } from "http";
import { createUserImplementation } from "./implementations/createUser";
import { getUsersImplementation } from "./implementations/getUsers";
import { userCreatedImplementation } from "./implementations/userCreated";

const handler = createHandler({
  clients: ["http://localhost:5173"],
  implementations: {
    createUser: createUserImplementation,
    getUsers: getUsersImplementation,
    userCreated: userCreatedImplementation
  }
})

const server = createServer(handler);

server.listen(8000, "0.0.0.0", () => {
  console.log("Server listening on http://localhost:8000");
});