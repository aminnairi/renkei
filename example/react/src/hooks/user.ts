import { ChangeEventHandler, FormEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import { Users } from '@example/shared/routes/getUsers';
import { client } from "../superblue/client";
import { useNotification } from './notification';
import { CancelError } from '@superblue/core';

export const useUser = () => {
  const { sendNotification } = useNotification();
  const firstnameRef = useRef<HTMLInputElement>();
  const lastnameRef = useRef<HTMLInputElement>();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState<Users>([]);
  const [error, setError] = useState("");
  const [firstnameError, setFirstnameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");

  const getUsersAbortController = useRef(new AbortController());
  const createUserAbortController = useRef(new AbortController());

  const focusFirstname = useCallback(() => {
    firstnameRef.current?.focus();
  }, []);

  const focusLastname = useCallback(() => {
    lastnameRef.current?.focus();
  }, []);

  const cancelGetUsers = useCallback(() => {
    getUsersAbortController.current.abort();
  }, []);

  const cancelCreateUser = useCallback(() => {
    createUserAbortController.current.abort();
  }, []);

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

      if (receivedUsers instanceof Error) {
        if (receivedUsers instanceof CancelError) {
          setError("Request canceled");
          return;
        }

        setError("Something went wrong, please try again later.");
        return;
      }

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
      setFirstnameError("");
      setLastnameError("");

      const response = await client.createUser({
        input: {
          firstname,
          lastname
        },
        signal: createUserAbortController.current.signal
      });

      if (response instanceof Error) {
        if (response instanceof CancelError) {
          setError("Request has been canceled.");
          return;
        }

        setError("Something went wrong, please try again later.");
        return;
      }

      ((): void => {
        switch (response.status) {
          case "SUCCESS":
            setLastname("");
            setFirstname("");
            focusFirstname();
            getUsers();
            return

          case "LIMITED":
            setError(`Request limited until ${response.retryAfter.toLocaleDateString("en-US")} ${response.retryAfter.toLocaleTimeString("en-US")}`);
            return

          case "FIRSTNAME_EMPTY":
            setFirstnameError("First name should not be empty.");
            focusFirstname();
            return

          case "FIRSTNAME_TOO_LONG":
            setFirstnameError("First name should be no more than 50 characters.");
            focusFirstname();
            return

          case "LASTNAME_EMPTY":
            setLastnameError("Last name should not be empty.");
            focusLastname();
            return

          case "LASTNAME_TOO_LONG":
            setLastnameError("Last name should be no more than 50 characters.");
            focusLastname();
            return

          case "USER_ALREADY_EXISTS":
            setError("User already exist.");
            focusFirstname();
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
  }, [firstname, focusFirstname, focusLastname, getUsers, lastname]);

  useEffect(() => {
    getUsers();

    return cancelGetUsers;
  }, [cancelGetUsers, getUsers]);

  useEffect(() => {
    return () => {
      cancelCreateUser();
    }
  }, [cancelCreateUser]);

  useEffect(() => {
    const stopListening = client.userCreated((user) => {
      sendNotification({
        message: `Received a user: ${user.firstname} ${user.lastname}`,
        severity: "success",
        duration: 5000
      });
    });

    return stopListening
  }, [sendNotification]);

  return {
    firstnameError,
    lastnameError,
    lastname,
    firstname,
    lastnameRef,
    firstnameRef,
    error,
    users,
    getUsers,
    createUser,
    updateFirstname,
    updateLastname
  };
};