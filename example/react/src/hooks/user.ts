import { ChangeEventHandler, FormEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { Users } from '@superblue/example-core/routes/getUsers';
import { client } from "../superblue/client";
import { exhaustive } from "exhaustive";
import { useNotification } from './notification';

export const useUser = () => {
  const { sendNotification } = useNotification();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState<Users>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    request: getUsersRequest,
    cancel: cancelGetUsersRequest
  } = useMemo(() => {
    return client.getUsers();
  }, []);

  const {
    cancel: cancelCreateUserRequest,
    request: createUserRequest
  } = useMemo(() => {
    return client.createUser();
  }, []);

  const updateFirstname: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setFirstname(event.target.value);
  }, []);

  const updateLastname: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setLastname(event.target.value);
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const receivedUsers = await getUsersRequest();
      setUsers(receivedUsers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Unexpected error: ${errorMessage}`);
    }
  }, [getUsersRequest]);

  const createUser: FormEventHandler = useCallback(async (event) => {
    try {
      event.preventDefault();
      setError("");
      setMessage("");

      const response = await createUserRequest({
        firstname,
        lastname
      });

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
  }, [createUserRequest, firstname, getUsers, lastname]);

  useEffect(() => {
    getUsers();

    return () => {
      cancelGetUsersRequest();
    }
  }, [cancelGetUsersRequest, getUsers]);

  useEffect(() => {
    return () => {
      cancelCreateUserRequest();
    }
  }, [cancelCreateUserRequest]);

  useEffect(() => {
    const stopListeningForUserCreatedEvents = client.userCreated((user) => {
      sendNotification({
        message: `Received a user: ${user.firstname} ${user.lastname}`,
        severity: "success",
        duration: 5000
      });
    });

    return () => {
      stopListeningForUserCreatedEvents();
    }
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