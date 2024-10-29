import { createHttpImplementation } from "@superblue/example-core";
import { randomUUID } from "crypto";
import { users } from "../state/users";
import { userCreatedEvent } from "../events/userCreatedEvent";

export const createUserImplementation = createHttpImplementation({
  route: "createUser",
  implementation: async ({ firstname, lastname }) => {
    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();

    if (trimmedFirstname.length === 0) {
      return {
        success: false,
        error: "FIRSTNAME_EMPTY"
      };
    }

    if (trimmedLastname.length === 0) {
      return {
        success: false,
        error: "LASTNAME_EMPTY"
      };
    }

    if (trimmedFirstname.length > 50) {
      return {
        success: false,
        error: "FIRSTNAME_TOO_LONG"
      };
    }

    if (trimmedLastname.length > 50) {
      return {
        success: false,
        error: "LASTNAME_TOO_LONG"
      };
    }

    const alreadyExistingUser = users.find(user => {
      return user.firstname === trimmedFirstname && user.lastname === trimmedLastname;
    });

    if (alreadyExistingUser) {
      return {
        success: false,
        error: "USER_ALREADY_EXISTS"
      };
    }

    const user = {
      identifier: randomUUID(),
      firstname: trimmedFirstname,
      lastname: trimmedLastname
    };

    users.push(user);

    userCreatedEvent.emit("user", user);

    return {
      success: true,
      message: `Created ${firstname}`
    }
  }
});