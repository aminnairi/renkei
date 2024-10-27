import { ChangeEventHandler, FormEventHandler, useCallback, useState } from 'react'
import { createClient } from "@superblue/example-core";
import { Users } from '@superblue/example-core/routes/getUsers';

const client = createClient({ server: "http://localhost:8000" });

function App() {
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
      } else {
        setError(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
    }
  }, [firstname, lastname]);

  const getUsers = useCallback(async () => {
    const receivedUsers = await client.getUsers();
    setUsers(receivedUsers);
  }, []);

  return (
    <>
      <h2>Create one user</h2>
      <small>{message}</small>
      <small style={{ color: "red" }}>{error}</small>
      <form onSubmit={createUser}>
        <input type="text" placeholder="First Name" value={firstname} onChange={updateFirstname} />
        <input type="text" placeholder="Last Name" value={lastname} onChange={updateLastname} />
        <button>Create</button>
      </form>
      <h2>Users</h2>
      <button onClick={getUsers}>Refresh</button>
      {users.length === 0 && (
        <p>No users available.</p>
      )}
      {users.length !== 0 && (
        <table>
          <tbody>
            {users.map(user => (
              <tr key={user.identifier}>
                <td>{user.identifier}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default App
