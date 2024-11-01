# @superblue/core

Effortless type-safe communication between client and server

## Installation

### TypeScript setup

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Package Installation

> Note: the package is not yet published

```bash
npm install @superblue/core
```

## Usage

```ts
import { createApplication, createRoute, z } from "@superblue/core";
import { createServer } from "http";

const createUserRoute = createRoute({
    request: z.object({
      firstname: z.string()
    }),
    response: z.discriminatedUnion("success", [
      z.object({
        success: z.literal(true),
        message: z.string()
      }),
      z.object({
        success: z.literal(false),
        error: z.string()
      })
    ])
  })

const {
  createClient,
  createHandler,
  createImplementation
} = createApplication({
  createUser: createUserRoute
});

const createUserImplementation = createImplementation({
  route: "createUser",
  implementation: async ({ firstname }) => {
    if (Math.random() > 0.5) {
      return {
        success: false,
        error: `Random error when creating ${firstname}`
      };
    }

    // ...

    return {
      success: true,
      message: `Createed ${firstname}`
    }
  }
});

const client = createClient({ server: "http://localhost:8000" });

const handler = createHandler({
  clients: ["http://localhost:8000"],
  implementations: {
    createUser: createUserImplementation
  }
})

const server = createServer(handler);

server.listen(8000, "0.0.0.0", () => {
  console.log("Server listening on http://localhost:8000");
});

const response = await client.createUser({
  firstname: "John DOE"
})

if (response.success) {
  console.log(response.message);
} else {
  console.error(response.error);
}

server.close();
```

## License

See [`LICENSE`](./LICENSE).

## Contributing

See [`CONTRIBUTING.md`](../../CONTRIBUTING.md).