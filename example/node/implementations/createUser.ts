import { randomUUID } from "crypto";
import { users } from "../state/users";
import { userCreatedEvent } from "../events/userCreatedEvent";
import { implementCreateUser } from "../../shared/routes/createUser";

export const createUserImplementation = implementCreateUser(async ({ firstname, lastname }) => {
  const trimmedFirstname = firstname.trim();
  const trimmedLastname = lastname.trim();

  if (trimmedFirstname.length === 0) {
    return {
      status: "FIRSTNAME_EMPTY"
    };
  }

  if (trimmedLastname.length === 0) {
    return {
      status: "LASTNAME_EMPTY"
    };
  }

  if (trimmedFirstname.length > 50) {
    return {
      status: "FIRSTNAME_TOO_LONG"
    };
  }

  if (trimmedLastname.length > 50) {
    return {
      status: "LASTNAME_TOO_LONG"
    };
  }

  const alreadyExistingUser = users.find(user => {
    return user.firstname === trimmedFirstname && user.lastname === trimmedLastname;
  });

  if (alreadyExistingUser) {
    return {
      status: "USER_ALREADY_EXISTS"
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
    status: "SUCCESS",
    message: `Created ${firstname}`
  }
});