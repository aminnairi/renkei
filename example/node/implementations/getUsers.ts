import { createImplementation } from "@superblue/example-core";
import { users } from "../state/users";

export const getUsersImplementation = createImplementation({
  route: "getUsers",
  implementation: async () => {
    return users;
  }
});