import { createHandler } from "@superblue/example-core";
import { createServer } from "http";
import { createUserImplementation } from "./implementations/createUser";
import { getUsersImplementation } from "./implementations/getUsers";

const handler = createHandler({
  clients: ["http://localhost:5173"],
  implementations: {
    createUser: createUserImplementation,
    getUsers: getUsersImplementation
  }
})

const server = createServer(handler);

server.listen(8000, "0.0.0.0", () => {
  console.log("Server listening on http://localhost:8000");
});