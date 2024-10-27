import { ChangeEventHandler, FormEventHandler, useCallback, useState } from 'react'
import { createClient } from "@superblue/example-core";
import { Users } from '@superblue/example-core/routes/getUsers';

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Container from "@mui/material/Container";

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
    <Container>
      <Stack spacing={3}>
        <Typography variant="h4" align="center">
          Create one user
        </Typography>
        {message && (
          <Alert severity="info">
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        <Stack component="form" onSubmit={createUser} spacing={3}>
          <TextField label="First Name" type="text" value={firstname} onChange={updateFirstname} />
          <TextField type="text" label="Last Name" value={lastname} onChange={updateLastname} />
          <Button variant="contained" sx={{ alignSelf: "center" }} type="submit">
            Create
          </Button>
        </Stack>
        <Typography variant="h4" align="center">Users</Typography>
        <Button onClick={getUsers} variant="outlined" sx={{ alignSelf: "center" }}>
          Refresh
        </Button>
        {users.length === 0 && (
          <Typography align="center">No users available.</Typography>
        )}
        {users.length !== 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Identifier
                  </TableCell>
                  <TableCell>
                    First Name
                  </TableCell>
                  <TableCell>
                    Last Name
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.identifier}>
                    <TableCell>{user.identifier}</TableCell>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Container>
  )
}

export default App
