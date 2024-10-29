import { createHttpImplementation } from "@superblue/example-core";
import { users } from "../state/users";

export const getUsersImplementation = createHttpImplementation({
  route: "getUsers",
  implementation: async () => {
    return users;
  }
});