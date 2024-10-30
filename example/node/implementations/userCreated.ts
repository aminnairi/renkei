import { createEventImplementation } from "@superblue/example-core";
import { userCreatedEvent } from "../events/userCreatedEvent";

export const userCreatedImplementation = createEventImplementation({
  route: "userCreated",
  implementation: async (send) => {
    userCreatedEvent.on("user", user => {
      send(user);
    })
  }
})