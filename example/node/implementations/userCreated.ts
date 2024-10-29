import { createServerSentEventImplementation } from "@superblue/example-core";
import { userCreatedEvent } from "../events/userCreatedEvent";

export const userCreatedImplementation = createServerSentEventImplementation({
  route: "userCreated",
  implementation: async (emit) => {
    userCreatedEvent.on("user", user => {
      emit(user);
    })
  }
})