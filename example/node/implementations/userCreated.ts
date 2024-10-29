import { createServerSentEventImplementation } from "@superblue/example-core";
import { randomUUID } from "crypto"

export const userCreatedImplementation = createServerSentEventImplementation({
  route: "userCreated",
  implementation: async (emit) => {
    setInterval(() => {
      emit({
        identifier: randomUUID(),
        lastname: randomUUID(),
        firstname: randomUUID()
      });
    }, 1000);
  }
})