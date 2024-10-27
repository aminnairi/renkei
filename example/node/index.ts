import { createImplementation, createHandler } from "@superblue/example-core";
import { createServer } from "http";

const createUserImplementation = createImplementation({
  route: "createUser",
  implementation: async ({ firstname }) => {
    if (Math.random() > 0.5) {
      return {
        success: false,
        error: `Random error when creating ${firstname}`
      };
    }

    return {
      success: true,
      message: `Created ${firstname}`
    }
  }
});


const handler = createHandler({
  clients: ["http://localhost:5173"],
  implementations: {
    createUser: createUserImplementation
  }
})

const server = createServer(handler);

server.listen(8000, "0.0.0.0", () => {
  console.log("Server listening on http://localhost:8000");
});