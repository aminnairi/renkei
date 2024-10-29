import { ChangeEventHandler, FormEventHandler, useCallback, useEffect, useState } from 'react'
import { Users } from '@superblue/example-core/routes/getUsers';
import { client } from "../superblue/client";
import { exhaustive } from "exhaustive";

export const useUser = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState<Users>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateFirstname: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setFirstname(event.target.value);
  }, []);

  const updateLastname: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setLastname(event.target.value);
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const receivedUsers = await client.getUsers(undefined);

      setUsers(receivedUsers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Unexpected error: ${errorMessage}`);
    }
  }, []);

  const createUser: FormEventHandler = useCallback(async (event) => {
    try {
      event.preventDefault();
      setError("");
      setMessage("");

      const response = await client.createUser({
        firstname,
        lastname
      })

      if (response.success) {
        setMessage(response.message);
        getUsers();
      } else {
        exhaustive(response.error, {
          FIRSTNAME_EMPTY: () => {
            setError("First name should not be empty.");
          },
          FIRSTNAME_TOO_LONG: () => {
            setError("First name should be no more than 50 characters.");
          },
          LASTNAME_EMPTY: () => {
            setError("Last name should not be empty.");
          },
          LASTNAME_TOO_LONG: () => {
            setError("Last name should be no more than 50 characters.");
          },
          USER_ALREADY_EXISTS: () => {
            setError("User already exist.");
          }
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Unexpected error: ${errorMessage}`);
    }
  }, [firstname, getUsers, lastname]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    client.userCreated((user) => {
      console.log(`Received a user: ${user.firstname} ${user.lastname}`);
    });
  }, []);

  return {
    lastname,
    firstname,
    error,
    message,
    users,
    getUsers,
    createUser,
    updateFirstname,
    updateLastname
  };
};