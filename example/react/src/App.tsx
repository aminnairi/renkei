import { useEffect, useState } from 'react'
import { createClient } from "@superblue/example-core";

const client = createClient({ server: "http://localhost:8000" });

function App() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const createUser = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    const response = await client.createUser({
      firstname: "John DOE"
    })

    if (response.success) {
      setMessage(response.message);
    } else {
      setError(response.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    createUser();
  }, []);

  if (loading) {
    return (
      <p>Loading, please wait...</p>
    );
  }

  if (error) {
    return (
      <p>An error occurred: {error}.</p>
    );
  }

  return (
    <p>Message from the server: {message}.</p>
  )
}

export default App
