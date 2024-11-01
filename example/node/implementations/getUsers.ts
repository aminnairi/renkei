import { implementGetUsers } from "../../shared/routes/getUsers";
import { users } from "../state/users";

export const getUsersImplementation = implementGetUsers(async () => {
  return users;
});