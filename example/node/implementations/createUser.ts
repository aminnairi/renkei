import { createImplementation } from "@superblue/example-core";
import { randomUUID } from "crypto";
import { users } from "../state/users";

export const createUserImplementation = createImplementation({
  route: "createUser",
  implementation: async ({ firstname, lastname }) => {
    const alreadyExistingUser = users.find(user => {
      return user.firstname === firstname && user.lastname === lastname;
    });

    if (alreadyExistingUser) {
      return {
        success: false,
        error: "User already exists."
      };
    }

    users.push({
      identifier: randomUUID(),
      firstname,
      lastname
    });

    return {
      success: true,
      message: `Created ${firstname}`
    }
  }
});