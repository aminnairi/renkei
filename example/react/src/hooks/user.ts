import { ChangeEventHandler, FormEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import { Users } from '@example/shared/routes/getUsers';
import { client } from "../superblue/client";
import { useNotification } from './notification';

export const useUser = () => {
  const { sendNotification } = useNotification();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState<Users>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getUsersAbortController = useRef(new AbortController());
  const createUserAbortController = useRef(new AbortController());

  const updateFirstname: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setFirstname(event.target.value);
  }, []);

  const updateLastname: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setLastname(event.target.value);
  }, []);

  const getUsers = useCallback(async () => {
    try {
      getUsersAbortController.current = new AbortController();

      const receivedUsers = await client.getUsers({
        input: null,
        signal: getUsersAbortController.current.signal
      });

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
        input: {
          firstname,
          lastname
        },
        signal: createUserAbortController.current.signal
      });

      ((): void => {
        switch (response.status) {
          case "SUCCESS":
            setMessage(response.message);
            getUsers();
            return

          case "LIMITED":
            setError(`Request limited until ${response.retryAfter.toLocaleDateString("en-US")} ${response.retryAfter.toLocaleTimeString("en-US")}`);
            return

          case "FIRSTNAME_EMPTY":
            setError("First name should not be empty.");
            return

          case "FIRSTNAME_TOO_LONG":
            setError("First name should be no more than 50 characters.");
            return

          case "LASTNAME_EMPTY":
            setError("Last name should not be empty.");
            return

          case "LASTNAME_TOO_LONG":
            setError("Last name should be no more than 50 characters.");
            return

          case "USER_ALREADY_EXISTS":
            setError("User already exist.");
            return

          case "UNEXPECTED_ERROR":
            setError("Unexpected error");
            return

          default:
            return response;
        }
      })()
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
      sendNotification({
        message: `Received a user: ${user.firstname} ${user.lastname}`,
        severity: "success",
        duration: 5000
      });
    });
  }, [sendNotification]);

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