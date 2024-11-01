import { userCreatedEvent } from "../events/userCreatedEvent";
import { implementUserCreated } from "../../shared/routes/userCreated";

export const userCreatedImplementation = implementUserCreated(send => {
  userCreatedEvent.on("user", user => {
    send(user);
  })
})